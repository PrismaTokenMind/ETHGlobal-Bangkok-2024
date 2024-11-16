import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    BotSummary
} from "../generated/schema";

export const DEFAULT_SUMMARY_CONST = '0x0000000000000000000000000000000000000001'
export const USDC_CONTRACT = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"

export function getBotSummary(): BotSummary {

    let botSummary = BotSummary.load(Bytes.fromUTF8(DEFAULT_SUMMARY_CONST));
    if (botSummary == null) {
        botSummary = new BotSummary(Bytes.fromUTF8(DEFAULT_SUMMARY_CONST))
        botSummary.depositBalance = BigInt.fromI32(0);
        botSummary.tradedUSDC = BigInt.fromI32(0);
        botSummary.numberOfTrades = BigInt.fromI32(0);
        botSummary.pnl = BigInt.fromI32(0);
    }

    return botSummary;
  }