import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { config } from "../config.js";
import { log } from "../logger.js";
import { toCosmosDecimal } from "../utils.js";
import type { RegimeInference } from "../state.js";

export async function submitRegimeUpdate(
  inference: RegimeInference
): Promise<string | null> {
  if (!config.contractAddress || !config.mnemonic) {
    log("info", "contract_submit_skipped", {
      reason: "CONTRACT_ADDRESS or MNEMONIC not configured",
      score: inference.score,
    });
    return null;
  }

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, {
    prefix: "cosmos",
  });
  const [account] = await wallet.getAccounts();
  const client = await SigningCosmWasmClient.connectWithSigner(
    config.rpcUrl,
    wallet,
    { gasPrice: GasPrice.fromString("0.025uatom") as never }
  );

  const msg = {
    update_regime_score: {
      score: inference.score,
      bonded_delta: toCosmosDecimal(inference.features.bondedRatioDelta),
      gov_delta: toCosmosDecimal(inference.features.govActivityDelta),
      ibc_delta: toCosmosDecimal(inference.features.ibcVolumeDelta),
    },
  };

  const result = await client.execute(
    account.address,
    config.contractAddress,
    msg,
    "auto"
  );

  log("info", "contract_submit_success", {
    txHash: result.transactionHash,
    score: inference.score,
  });

  return result.transactionHash;
}
