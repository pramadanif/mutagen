/// specimen.rs — Raid Boss Milestone (post-submission feature branch)
///
/// Implements the Specimen merge formula, archetype classification, and
/// phase-dependent damage modifier. Unit tests cover every archetype × phase
/// combination so the balance claim is verifiable on-chain, not just in docs.

// ─── Tier index constants ─────────────────────────────────────────────────
pub const TIER_COMMON: u8 = 0;
pub const TIER_RARE: u8 = 1;
pub const TIER_EPIC: u8 = 2;
pub const TIER_LEGENDARY: u8 = 3;

/// Map a tier name string to its numeric index (0=COMMON … 3=LEGENDARY).
pub fn tier_index(name: &str) -> u8 {
    match name {
        "RARE" => TIER_RARE,
        "EPIC" => TIER_EPIC,
        "LEGENDARY" => TIER_LEGENDARY,
        _ => TIER_COMMON,
    }
}

// ─── Archetype ────────────────────────────────────────────────────────────

/// Specimen archetype — determines damage modifier sensitivity to regime phase.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Archetype {
    /// All 4 inputs are the same tier.
    Pure,
    /// Two pairs of matching tiers (e.g. 2×RARE + 2×EPIC).
    Balanced,
    /// All 4 tiers are distinct.
    Hybrid,
}

impl Archetype {
    pub fn as_str(&self) -> &'static str {
        match self {
            Archetype::Pure => "Pure",
            Archetype::Balanced => "Balanced",
            Archetype::Hybrid => "Hybrid",
        }
    }
}

/// Classify the archetype from four tier index values.
///
/// Rules (in priority order):
///   - All same  → Pure
///   - Exactly 2+2 pairs → Balanced
///   - Anything else (including 3+1 or all-different) → Hybrid
pub fn compute_archetype(tier_indices: [u8; 4]) -> Archetype {
    let mut counts = [0u8; 4]; // index = tier (0..3)
    for &idx in &tier_indices {
        let slot = idx.min(3) as usize;
        counts[slot] += 1;
    }

    let unique = counts.iter().filter(|&&c| c > 0).count();

    if unique == 1 {
        // All 4 are the same tier
        return Archetype::Pure;
    }

    if unique == 2 {
        // Two groups — check if it's 2+2 (Balanced) or 3+1 (Hybrid)
        let pairs = counts.iter().all(|&c| c == 0 || c == 2);
        if pairs {
            return Archetype::Balanced;
        }
        // 3+1 counts as Hybrid
        return Archetype::Hybrid;
    }

    // 3 or 4 unique tiers → Hybrid
    Archetype::Hybrid
}

// ─── Power ────────────────────────────────────────────────────────────────

/// Tier base power values (before archetype modifier).
///
/// Scale is intentionally simple; actual damage is scaled by the phase
/// modifier separately so the math stays readable in unit tests.
const TIER_BASE_POWER: [u32; 4] = [
    100, // COMMON
    200, // RARE
    400, // EPIC
    800, // LEGENDARY
];

/// Compute the raw power of a Specimen from the four input tier indices.
///
/// Archetype modifier (applied before phase):
///   - Pure:     sum × 1.3  (highest ceiling, but hit by CALM penalty)
///   - Balanced: sum × 1.0
///   - Hybrid:   sum × 0.85 (lowest raw power, but immune to phase penalties)
///
/// All multiplications are scaled ×100 then divided at the end to avoid
/// floating point in the contract.
pub fn compute_power(tier_indices: [u8; 4], archetype: Archetype) -> u32 {
    let base_sum: u32 = tier_indices
        .iter()
        .map(|&i| TIER_BASE_POWER[i.min(3) as usize])
        .sum();

    // Archetype modifier in hundredths (100 = ×1.0)
    let archetype_mult = match archetype {
        Archetype::Pure => 130u32,
        Archetype::Balanced => 100u32,
        Archetype::Hybrid => 85u32,
    };

    base_sum * archetype_mult / 100
}

// ─── Phase modifier ───────────────────────────────────────────────────────

/// Regime phase derived from regime score bands (mirrors loot-table.ts).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Calm,      // score 0–30
    Elevated,  // score 31–60
    Turbulent, // score 61–100
}

impl Phase {
    pub fn from_score(score: u8) -> Phase {
        if score <= 30 {
            Phase::Calm
        } else if score <= 60 {
            Phase::Elevated
        } else {
            Phase::Turbulent
        }
    }
}

/// Apply the regime phase damage modifier to a Specimen's base power.
///
/// Design intent (from spec §1):
///   CALM:      Pure −30% | Balanced 0% | Hybrid  0%
///   ELEVATED:  Pure   0% | Balanced 0% | Hybrid  0%  (all equal)
///   TURBULENT: Pure +30% | Balanced 0% | Hybrid  0%
///
/// Net effect: Pure is high-variance (risky), Hybrid is flat (safe),
/// Balanced is neutral. Optimal choice depends on which regime is active.
///
/// Multiplications use integer hundredths to stay WASM-safe (no f64).
pub fn apply_phase_modifier(base_power: u32, archetype: Archetype, phase: Phase) -> u32 {
    // Phase×Archetype modifier in hundredths (100 = ×1.0)
    let modifier: u32 = match (phase, archetype) {
        (Phase::Calm, Archetype::Pure) => 70,       // −30%
        (Phase::Turbulent, Archetype::Pure) => 130,  // +30%
        _ => 100,                                    // all others: no change
    };

    base_power * modifier / 100
}

// ─── Convenience: compute final damage in one call ────────────────────────

/// Full pipeline: tiers → archetype → power → phase-modified damage.
pub fn compute_damage(tier_indices: [u8; 4], regime_score: u8) -> (Archetype, u32, u32) {
    let archetype = compute_archetype(tier_indices);
    let power = compute_power(tier_indices, archetype);
    let phase = Phase::from_score(regime_score);
    let damage = apply_phase_modifier(power, archetype, phase);
    (archetype, power, damage)
}

// ─── Unit tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // ── Archetype classification ─────────────────────────────────────────

    #[test]
    fn test_archetype_pure_all_same() {
        let indices = [TIER_RARE, TIER_RARE, TIER_RARE, TIER_RARE];
        assert_eq!(compute_archetype(indices), Archetype::Pure);
    }

    #[test]
    fn test_archetype_pure_legendary() {
        let indices = [TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY];
        assert_eq!(compute_archetype(indices), Archetype::Pure);
    }

    #[test]
    fn test_archetype_balanced_two_pairs() {
        // 2×RARE + 2×EPIC
        let indices = [TIER_RARE, TIER_EPIC, TIER_RARE, TIER_EPIC];
        assert_eq!(compute_archetype(indices), Archetype::Balanced);
    }

    #[test]
    fn test_archetype_balanced_common_legendary() {
        // 2×COMMON + 2×LEGENDARY
        let indices = [TIER_COMMON, TIER_LEGENDARY, TIER_COMMON, TIER_LEGENDARY];
        assert_eq!(compute_archetype(indices), Archetype::Balanced);
    }

    #[test]
    fn test_archetype_hybrid_all_different() {
        let indices = [TIER_COMMON, TIER_RARE, TIER_EPIC, TIER_LEGENDARY];
        assert_eq!(compute_archetype(indices), Archetype::Hybrid);
    }

    #[test]
    fn test_archetype_hybrid_three_plus_one() {
        // 3×RARE + 1×EPIC → Hybrid (not Pure, not balanced 2+2)
        let indices = [TIER_RARE, TIER_RARE, TIER_RARE, TIER_EPIC];
        assert_eq!(compute_archetype(indices), Archetype::Hybrid);
    }

    // ── Phase × Archetype damage modifier (9 combinations) ──────────────
    // Using a fixed base_power of 1000 for easy arithmetic:
    //   Calm+Pure   → 700   (×0.70)
    //   Calm+Balanced → 1000 (×1.00)
    //   Calm+Hybrid → 1000 (×1.00)
    //   Elevated+Pure → 1000 (×1.00)
    //   Elevated+Balanced → 1000
    //   Elevated+Hybrid → 1000
    //   Turbulent+Pure → 1300 (×1.30)
    //   Turbulent+Balanced → 1000
    //   Turbulent+Hybrid → 1000

    #[test]
    fn test_phase_calm_pure_penalty() {
        let damage = apply_phase_modifier(1000, Archetype::Pure, Phase::Calm);
        assert_eq!(damage, 700, "CALM phase should reduce Pure damage by 30%");
    }

    #[test]
    fn test_phase_calm_balanced_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Balanced, Phase::Calm);
        assert_eq!(damage, 1000, "CALM phase should not affect Balanced");
    }

    #[test]
    fn test_phase_calm_hybrid_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Hybrid, Phase::Calm);
        assert_eq!(damage, 1000, "CALM phase should not affect Hybrid");
    }

    #[test]
    fn test_phase_elevated_pure_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Pure, Phase::Elevated);
        assert_eq!(damage, 1000, "ELEVATED phase: Pure should be neutral");
    }

    #[test]
    fn test_phase_elevated_balanced_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Balanced, Phase::Elevated);
        assert_eq!(damage, 1000, "ELEVATED phase: Balanced neutral");
    }

    #[test]
    fn test_phase_elevated_hybrid_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Hybrid, Phase::Elevated);
        assert_eq!(damage, 1000, "ELEVATED phase: Hybrid neutral");
    }

    #[test]
    fn test_phase_turbulent_pure_bonus() {
        let damage = apply_phase_modifier(1000, Archetype::Pure, Phase::Turbulent);
        assert_eq!(damage, 1300, "TURBULENT phase should boost Pure damage by 30%");
    }

    #[test]
    fn test_phase_turbulent_balanced_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Balanced, Phase::Turbulent);
        assert_eq!(damage, 1000, "TURBULENT phase: Balanced neutral");
    }

    #[test]
    fn test_phase_turbulent_hybrid_neutral() {
        let damage = apply_phase_modifier(1000, Archetype::Hybrid, Phase::Turbulent);
        assert_eq!(damage, 1000, "TURBULENT phase: Hybrid neutral");
    }

    // ── Full pipeline smoke tests ─────────────────────────────────────────

    #[test]
    fn test_full_pipeline_pure_legendary_calm() {
        // 4×LEGENDARY Pure in CALM: highest raw power, penalised by CALM
        // power = 4×800 × 1.30 = 4160
        // damage = 4160 × 0.70 = 2912
        let (archetype, power, damage) = compute_damage(
            [TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY],
            15, // CALM
        );
        assert_eq!(archetype, Archetype::Pure);
        assert_eq!(power, 4160);
        assert_eq!(damage, 2912);
    }

    #[test]
    fn test_full_pipeline_pure_legendary_turbulent() {
        // 4×LEGENDARY Pure in TURBULENT: maximum possible damage
        // power = 4160, damage = 4160 × 1.30 = 5408
        let (archetype, power, damage) = compute_damage(
            [TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY, TIER_LEGENDARY],
            80, // TURBULENT
        );
        assert_eq!(archetype, Archetype::Pure);
        assert_eq!(power, 4160);
        assert_eq!(damage, 5408);
    }

    #[test]
    fn test_full_pipeline_hybrid_all_tiers_calm() {
        // All-different Hybrid in CALM: no penalty, consistent damage
        // power = (100+200+400+800) × 0.85 = 1500 × 0.85 = 1275
        // damage = 1275 × 1.0 = 1275
        let (archetype, power, damage) = compute_damage(
            [TIER_COMMON, TIER_RARE, TIER_EPIC, TIER_LEGENDARY],
            10, // CALM
        );
        assert_eq!(archetype, Archetype::Hybrid);
        assert_eq!(power, 1275);
        assert_eq!(damage, 1275);
    }

    #[test]
    fn test_full_pipeline_hybrid_all_tiers_turbulent() {
        // Hybrid in TURBULENT: same power, no bonus (flat safety)
        let (archetype, _power, damage) = compute_damage(
            [TIER_COMMON, TIER_RARE, TIER_EPIC, TIER_LEGENDARY],
            90, // TURBULENT
        );
        assert_eq!(archetype, Archetype::Hybrid);
        assert_eq!(damage, 1275); // same as CALM — no phase sensitivity
    }

    #[test]
    fn test_pure_beats_hybrid_in_turbulent() {
        // Key design assertion: Pure RARE×4 should out-damage Hybrid in TURBULENT
        let (_at, _pw, pure_damage) = compute_damage(
            [TIER_RARE, TIER_RARE, TIER_RARE, TIER_RARE],
            80, // TURBULENT
        );
        let (_at, _pw, hybrid_damage) = compute_damage(
            [TIER_COMMON, TIER_RARE, TIER_EPIC, TIER_LEGENDARY],
            80,
        );
        assert!(
            pure_damage > hybrid_damage,
            "Pure RARE×4 ({}) should beat Hybrid all-tiers ({}) in TURBULENT",
            pure_damage, hybrid_damage
        );
    }

    #[test]
    fn test_hybrid_beats_pure_in_calm() {
        // Key design assertion: Hybrid beats Pure RARE×4 in CALM
        let (_at, _pw, pure_damage) = compute_damage(
            [TIER_RARE, TIER_RARE, TIER_RARE, TIER_RARE],
            10, // CALM
        );
        let (_at, _pw, hybrid_damage) = compute_damage(
            [TIER_COMMON, TIER_RARE, TIER_EPIC, TIER_LEGENDARY],
            10,
        );
        assert!(
            hybrid_damage > pure_damage,
            "Hybrid all-tiers ({}) should beat Pure RARE×4 ({}) in CALM",
            hybrid_damage, pure_damage
        );
    }

    #[test]
    fn test_tier_index_mapping() {
        assert_eq!(tier_index("COMMON"), 0);
        assert_eq!(tier_index("RARE"), 1);
        assert_eq!(tier_index("EPIC"), 2);
        assert_eq!(tier_index("LEGENDARY"), 3);
        assert_eq!(tier_index("UNKNOWN"), 0); // defaults to COMMON
    }
}
