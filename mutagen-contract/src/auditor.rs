use std::str::FromStr;

use cosmwasm_std::{Decimal, Fraction, Uint128};

use crate::state::{AuditorState, Intervention};

const GINI_THRESHOLD: &str = "0.6";
const GINI_TARGET: &str = "0.4";

pub fn compute_gini(values: &[Uint128]) -> Decimal {
    if values.is_empty() {
        return Decimal::zero();
    }

    let mut sorted: Vec<u128> = values.iter().map(|v| v.u128()).collect();
    sorted.sort_unstable();

    let n = sorted.len() as u128;
    let sum: u128 = sorted.iter().sum();
    if sum == 0 {
        return Decimal::zero();
    }

    let mut numerator = 0u128;
    for (i, val) in sorted.iter().enumerate() {
        let rank = 2 * (i as u128 + 1);
        let term = rank.saturating_add(n).saturating_sub(1);
        numerator = numerator.saturating_add(term.saturating_mul(*val));
    }

    Decimal::from_ratio(numerator, n.saturating_mul(sum))
}

pub fn maybe_run_audit(
    auditor: &mut AuditorState,
    curve: &mut crate::state::CurveState,
    payouts: &[Uint128],
    pull_count: u64,
    now: cosmwasm_std::Timestamp,
) -> Option<Intervention> {
    if pull_count == 0 || pull_count % auditor.k_interval != 0 {
        return None;
    }

    let gini = compute_gini(payouts);
    auditor.zero_sum_index = gini;
    auditor.last_check_at_pull = pull_count;

    let threshold = Decimal::from_str(GINI_THRESHOLD).unwrap();
    let mut intervention = Intervention {
        timestamp: now,
        pull_number: pull_count,
        gini_before: gini,
        threshold,
        action: "none".to_string(),
        param_after: curve.payout_cap,
    };

    if gini > threshold {
        let fee_option = curve.fee_rate + Decimal::from_str("0.005").unwrap();
        let cap_option = curve.payout_cap * Decimal::from_str("0.98").unwrap();
        let target = Decimal::from_str(GINI_TARGET).unwrap();
        let gini_if_fee = abs_diff(gini, target);
        let gini_if_cap = abs_diff(
            Decimal::from_ratio(gini.numerator().u128() * 95, gini.denominator().u128() * 100),
            target,
        );

        if gini_if_fee <= gini_if_cap && curve.fee_rate < Decimal::from_str("0.05").unwrap() {
            curve.fee_rate = fee_option.min(Decimal::from_str("0.05").unwrap());
            intervention.action = "fee_increase_0.005".to_string();
            intervention.param_after = curve.fee_rate;
        } else if curve.payout_cap > Decimal::from_str("0.85").unwrap() {
            curve.payout_cap = cap_option.max(Decimal::from_str("0.85").unwrap());
            intervention.action = "cap_decrease_2pct".to_string();
            intervention.param_after = curve.payout_cap;
        }

        auditor.intervention_count += 1;
    }

    auditor.intervention_log.push(intervention.clone());
    if auditor.intervention_log.len() > 100 {
        let drain = auditor.intervention_log.len() - 100;
        auditor.intervention_log.drain(0..drain);
    }

    Some(intervention)
}

fn abs_diff(a: Decimal, b: Decimal) -> Decimal {
    if a >= b {
        a - b
    } else {
        b - a
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gini_increases_with_concentration() {
        let even = compute_gini(&[Uint128::new(10), Uint128::new(10), Uint128::new(10)]);
        let skewed = compute_gini(&[Uint128::new(10), Uint128::new(10), Uint128::new(100)]);
        assert!(skewed > even);
    }
}
