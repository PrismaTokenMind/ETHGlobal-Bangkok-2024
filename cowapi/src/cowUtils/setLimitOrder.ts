import { OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, OrderSigningUtils, SigningScheme, SupportedChainId, UnsignedOrder } from '@cowprotocol/cow-sdk';

import { getSignerFromPK, generateFunctionCallData} from './web3Utils';
import stringify from 'json-stringify-deterministic';
import keccak256 from 'keccak256';
  

export interface LimitOrderInputDataSchema {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    duration: number;
    ownerAddress: string;
}

const FUND_CONTRACT = '0xE1C147F0Cc536aecfD51E8Aed87AeB1fc3f1DA45'

export async function setLimitOrder(orderInputData: LimitOrderInputDataSchema):
Promise<{
    orderId: string;
}>  {
    const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.ARBITRUM_ONE });

    const signer = getSignerFromPK(orderInputData.ownerAddress);

    const ownerAddress = signer.address;

    const sellToken = orderInputData.sellToken;
    const buyToken = orderInputData.buyToken;
    const sellAmount = orderInputData.sellAmount;
    const buyAmount = orderInputData.buyAmount;
    const duration = orderInputData.duration;

    const contractCallDataPre = await generateFunctionCallData('limitOrderCreated', ['uint256','uint256','address','address'], [`${sellAmount}`, `${buyAmount}`, `${sellToken}`, `${buyToken}`]);

    const contractCallDataPost = await generateFunctionCallData('tradeCompleted', ['uint256','uint256','address','address'], [`${sellAmount}`, `${buyAmount}`, `${sellToken}`, `${buyToken}`]);

    const simpleAppData = {
        "appCode": "AI AGENT TRADER",
        "metadata": {
          "hooks": {
            "version": "0.1.0",
            "pre": [
                {
                    "callData": contractCallDataPre,
                    "gasLimit": "200000",
                    "target": FUND_CONTRACT
                }
            ],
            "post": [
                {
                    "callData": contractCallDataPost,
                    "gasLimit": "200000",
                    "target": FUND_CONTRACT
                }
            ]
          }
        },
        "version": "1.3.0"
    }

    const formattedAppData = stringify(simpleAppData);

    const hashedAppData = '0x' + keccak256(formattedAppData).toString('hex')
  
    const quoteRequest: OrderQuoteRequest = {
        sellToken,
        buyToken,
        from: ownerAddress,
        receiver: ownerAddress,
        sellAmountBeforeFee: sellAmount,
        kind: OrderQuoteSideKindSell.SELL,
        validFor: duration,
        appData: formattedAppData,
        appDataHash: hashedAppData,
    };

    const { quote } = await orderBookApi.getQuote(quoteRequest);
    
    // Use the original sellAmount, which is equal to quoted sellAmount added to quoted feeAmount
    // sellAmount === BigNumber.from(quote.sellAmount).add(BigNumber.from(quote.feeAmount)).toString()

    const feeAmount = "0";

    const order: UnsignedOrder = {
      ...quote,
      sellAmount: sellAmount,
      buyAmount: buyAmount,
      feeAmount,
      receiver: ownerAddress,
      appData: hashedAppData,
    }

    const orderSigningResult = await OrderSigningUtils.signOrder(order, SupportedChainId.ARBITRUM_ONE, signer)

    try {
        const orderId = await orderBookApi.sendOrder({
            ...quote,
            ...orderSigningResult,
            sellAmount: order.sellAmount, // replace quote sellAmount with signed order sellAmount, which is equal to original sellAmount
            buyAmount: order.buyAmount,
            feeAmount: order.feeAmount, // replace quote feeAmount with signed order feeAmount, which is 0
            signingScheme: orderSigningResult.signingScheme as unknown as SigningScheme
        })
    
        return {
            orderId,
        }    
    } catch (e) {
        console.error(e);
        return { orderId: '0' }; 
    }
}