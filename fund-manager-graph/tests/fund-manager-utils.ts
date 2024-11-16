import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AdminWithdraw,
  BotDeposit,
  Deposit,
  LimitOrderCreated,
  TradeCompleted,
  Withdraw
} from "../generated/FundManager/FundManager"

export function createAdminWithdrawEvent(amount: BigInt): AdminWithdraw {
  let adminWithdrawEvent = changetype<AdminWithdraw>(newMockEvent())

  adminWithdrawEvent.parameters = new Array()

  adminWithdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return adminWithdrawEvent
}

export function createBotDepositEvent(amount: BigInt): BotDeposit {
  let botDepositEvent = changetype<BotDeposit>(newMockEvent())

  botDepositEvent.parameters = new Array()

  botDepositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return botDepositEvent
}

export function createDepositEvent(user: Address, amount: BigInt): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositEvent
}

export function createLimitOrderCreatedEvent(
  amountIn: BigInt,
  amountOut: BigInt,
  tokenIn: Address,
  tokenOut: Address
): LimitOrderCreated {
  let limitOrderCreatedEvent = changetype<LimitOrderCreated>(newMockEvent())

  limitOrderCreatedEvent.parameters = new Array()

  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(amountOut)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )

  return limitOrderCreatedEvent
}

export function createTradeCompletedEvent(
  amountIn: BigInt,
  amountOut: BigInt,
  tokenIn: Address,
  tokenOut: Address
): TradeCompleted {
  let tradeCompletedEvent = changetype<TradeCompleted>(newMockEvent())

  tradeCompletedEvent.parameters = new Array()

  tradeCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  tradeCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(amountOut)
    )
  )
  tradeCompletedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  tradeCompletedEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )

  return tradeCompletedEvent
}

export function createWithdrawEvent(user: Address, amount: BigInt): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawEvent
}
