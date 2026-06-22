use cosmwasm_std::Decimal;

use crate::state::{LootTableState, LootTier};

const TIER_NAMES: [&str; 4] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

pub fn default_tiers() -> Vec<LootTier> {
    vec![
        LootTier {
            name: "COMMON".to_string(),
            base_weight: 55,
            current_weight: 55,
            payout_multiplier: Decimal::one(),
        },
        LootTier {
            name: "RARE".to_string(),
            base_weight: 28,
            current_weight: 28,
            payout_multiplier: Decimal::from_atomics(25u128, 1).unwrap(),
        },
        LootTier {
            name: "EPIC".to_string(),
            base_weight: 12,
            current_weight: 12,
            payout_multiplier: Decimal::from_atomics(5u128, 0).unwrap(),
        },
        LootTier {
            name: "LEGENDARY".to_string(),
            base_weight: 5,
            current_weight: 5,
            payout_multiplier: Decimal::from_atomics(12u128, 0).unwrap(),
        },
    ]
}

pub fn rescale_loot_table(score: u8, updated_at: cosmwasm_std::Timestamp) -> LootTableState {
    let mut tiers = match score {
        0..=30 => vec![
            (55u32, Decimal::one()),
            (28, Decimal::from_atomics(25u128, 1).unwrap()),
            (12, Decimal::from_atomics(5u128, 0).unwrap()),
            (5, Decimal::from_atomics(12u128, 0).unwrap()),
        ],
        31..=60 => vec![
            (40, Decimal::from_atomics(12u128, 1).unwrap()),
            (30, Decimal::from_atomics(3u128, 0).unwrap()),
            (20, Decimal::from_atomics(6u128, 0).unwrap()),
            (10, Decimal::from_atomics(15u128, 0).unwrap()),
        ],
        _ => vec![
            (25, Decimal::from_atomics(15u128, 1).unwrap()),
            (25, Decimal::from_atomics(4u128, 0).unwrap()),
            (25, Decimal::from_atomics(8u128, 0).unwrap()),
            (25, Decimal::from_atomics(25u128, 0).unwrap()),
        ],
    };

    let tiers: Vec<LootTier> = tiers
        .into_iter()
        .enumerate()
        .map(|(i, (weight, mult))| LootTier {
            name: TIER_NAMES[i].to_string(),
            base_weight: weight,
            current_weight: weight,
            payout_multiplier: mult,
        })
        .collect();

    LootTableState {
        regime_score: score,
        tiers,
        last_updated: updated_at,
    }
}

pub fn apply_resonance_bonus(tiers: &[LootTier], hub_staker: bool) -> Vec<LootTier> {
    if !hub_staker {
        return tiers.to_vec();
    }

    let mut adjusted = tiers.to_vec();
    if adjusted.len() < 4 {
        return adjusted;
    }

    adjusted[0].current_weight = adjusted[0].current_weight.saturating_sub(5).max(10);
    adjusted[1].current_weight += 2;
    adjusted[2].current_weight += 2;
    adjusted[3].current_weight += 1;
    adjusted
}

pub fn draw_tier(tiers: &[LootTier], seed: u64) -> usize {
    let total: u32 = tiers.iter().map(|t| t.current_weight).sum();
    if total == 0 {
        return 0;
    }
    let roll = (seed % total as u64) as u32;
    let mut acc = 0u32;
    for (idx, tier) in tiers.iter().enumerate() {
        acc += tier.current_weight;
        if roll < acc {
            return idx;
        }
    }
    tiers.len() - 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calm_table_has_four_tiers() {
        let table = rescale_loot_table(10, cosmwasm_std::Timestamp::from_seconds(0));
        assert_eq!(table.tiers.len(), 4);
        assert_eq!(table.tiers[0].name, "COMMON");
    }

    #[test]
    fn draw_is_deterministic() {
        let tiers = default_tiers();
        assert_eq!(draw_tier(&tiers, 42), draw_tier(&tiers, 42));
    }
}
