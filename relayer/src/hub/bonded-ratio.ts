import { config } from "../config.js";
import { computeDelta } from "../utils.js";
import { state } from "../state.js";

interface StakingPool {
  pool: {
    bonded_tokens: string;
    not_bonded_tokens: string;
  };
}

export async function fetchBondedRatioDelta(): Promise<number> {
  const res = await fetch(`${config.restUrl}/cosmos/staking/v1beta1/pool`);
  if (!res.ok) throw new Error(`staking pool HTTP ${res.status}`);
  const data = (await res.json()) as StakingPool;
  const bonded = BigInt(data.pool.bonded_tokens);
  const notBonded = BigInt(data.pool.not_bonded_tokens);
  const total = bonded + notBonded;
  const ratio = total === 0n ? 0 : Number(bonded) / Number(total);

  const prev = state.snapshots.bondedRatio;
  state.snapshots.bondedRatio = ratio;
  return computeDelta(ratio, prev);
}
