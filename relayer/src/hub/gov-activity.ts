import { config } from "../config.js";
import { computeDelta } from "../utils.js";
import { state } from "../state.js";

interface ProposalsResponse {
  proposals: { id: string; status: string }[];
}

export async function fetchGovActivityDelta(): Promise<{ delta: number; active: number }> {
  const res = await fetch(
    `${config.restUrl}/cosmos/gov/v1/proposals?proposal_status=PROPOSAL_STATUS_VOTING_PERIOD&pagination.limit=50`
  );
  if (!res.ok) throw new Error(`gov proposals HTTP ${res.status}`);
  const data = (await res.json()) as ProposalsResponse;
  const active = data.proposals?.length ?? 0;

  const prev = state.snapshots.govActiveCount;
  state.snapshots.govActiveCount = active;
  const delta = computeDelta(active, prev);

  return { delta, active };
}
