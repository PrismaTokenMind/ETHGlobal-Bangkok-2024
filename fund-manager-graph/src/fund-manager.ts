import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AdminWithdraw as AdminWithdrawEvent,
  BotDeposit as BotDepositEvent,
  Deposit as DepositEvent,
  LimitOrderCreated as LimitOrderCreatedEvent,
  TradeCompleted as TradeCompletedEvent,
  Withdraw as WithdrawEvent
} from "../generated/FundManager/FundManager"
import {
  LimitOrderCreated,
  TradeCompleted,
} from "../generated/schema"
import { getBotSummary, USDC_CONTRACT } from "./helpers"


export function handleDeposit(event: DepositEvent): void {
  let botSummary = getBotSummary();

  botSummary.depositBalance = botSummary.depositBalance.plus(event.params.amount)

  botSummary.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
  let botSummary = getBotSummary();

  botSummary.depositBalance = botSummary.depositBalance.minus(event.params.amount)

  botSummary.save()
}

export function handleLimitOrderCreated(event: LimitOrderCreatedEvent): void {
  let entity = new LimitOrderCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.amountIn = event.params.amountIn
  entity.amountOut = event.params.amountOut
  entity.tokenIn = event.params.tokenIn
  entity.tokenOut = event.params.tokenOut

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTradeCompleted(event: TradeCompletedEvent): void {

  let botSummary = getBotSummary();

  if (event.params.tokenIn == Address.fromString(USDC_CONTRACT)) {
    botSummary.tradedUSDC = botSummary.tradedUSDC.plus(event.params.amountIn)
  } else {
    botSummary.tradedUSDC = botSummary.tradedUSDC.plus(event.params.amountOut)
  }

  botSummary.numberOfTrades = botSummary.numberOfTrades.plus(BigInt.fromI32(1))

  let entity = new TradeCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.amountIn = event.params.amountIn
  entity.amountOut = event.params.amountOut
  entity.tokenIn = event.params.tokenIn
  entity.tokenOut = event.params.tokenOut

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  botSummary.save()
}
