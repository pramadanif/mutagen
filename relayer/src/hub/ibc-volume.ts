import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { config } from "../config.js";
import { computeDelta, withRetry } from "../utils.js";
import { state } from "../state.js";
import { log } from "../logger.js";

const QUERIES = [
  "message.module='transfer'",
  "message.action='/ibc.applications.transfer.v1.MsgTransfer'",
  "transfer.packet_data_hex",
];

async function countIbcTxs(tm: Tendermint37Client, sinceHeight: number): Promise<number> {
  let total = 0;
  for (const query of QUERIES) {
    try {
      const result = await tm.txSearch({
        query,
        page: 1,
        per_page: 100,
        order_by: "desc",
      });
      const recent = result.txs.filter((tx) => tx.height >= sinceHeight);
      total = Math.max(total, recent.length);
    } catch {
      // try next query shape
    }
  }
  return total;
}

export async function fetchIbcVolumeDelta(): Promise<number> {
  return withRetry(async () => {
    const tm = await Tendermint37Client.connect(config.rpcUrl);
    try {
      const status = await tm.status();
      const currentHeight = status.syncInfo.latestBlockHeight;
      const blocksPerHour = 600;
      const sinceHeight = Math.max(1, currentHeight - blocksPerHour);

      const count = await countIbcTxs(tm, sinceHeight);
      const prev = state.snapshots.ibcTxCount;
      state.snapshots.ibcTxCount = count;

      log("info", "ibc_volume_sample", {
        count,
        sinceHeight,
        currentHeight,
        queryWindowBlocks: blocksPerHour,
      });

      return computeDelta(count, prev);
    } finally {
      tm.disconnect();
    }
  }, "ibc_volume_fetch");
}
