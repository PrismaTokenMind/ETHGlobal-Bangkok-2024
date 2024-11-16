import { OrderBookApi, OrderQuoteRequest, OrderQuoteSideKindSell, OrderSigningUtils, SigningScheme, SupportedChainId, UnsignedOrder, SigningResult } from '@cowprotocol/cow-sdk';

import { getSignerFromPK, generateFunctionCallData} from './web3Utils';
import stringify from 'json-stringify-deterministic';
import keccak256 from 'keccak256';

export interface OrderInputDataSchema {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    ownerAddress: string;
}

const ARBITRUM_ONE_CHAIN_ID = 42161;
const ARBITRUM_ONE_SETTELMENT_CONTRACT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41';
const FUND_CONTRACT = '0xE1C147F0Cc536aecfD51E8Aed87AeB1fc3f1DA45'


export async function getUnsignedOrderDigest(orderInputData: OrderInputDataSchema):
Promise<{
    orderId: string;
}> {

    const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.ARBITRUM_ONE });

    const signer = getSignerFromPK(orderInputData.ownerAddress);

    const ownerAddress = signer.address;

    const sellToken = orderInputData.sellToken;
    const buyToken = orderInputData.buyToken;
    const sellAmount = orderInputData.sellAmount;

    const testQuoteRequest: OrderQuoteRequest = {
        sellToken,
        buyToken,
        from: ownerAddress,
        receiver: ownerAddress,
        sellAmountBeforeFee: sellAmount,
        kind: OrderQuoteSideKindSell.SELL,
    };

    const { quote: testQuote } = await orderBookApi.getQuote(testQuoteRequest);

    const contractCallData = await generateFunctionCallData('tradeCompleted', ['uint256','uint256','address','address'], [`${sellAmount}`, `${testQuote.buyAmount}`, `${sellToken}`, `${buyToken}`]);

    const simpleAppData = {
        "appCode": "AI AGENT TRADER",
        "metadata": {
          "hooks": {
            "version": "0.1.0",
            "post": [
                {
                    "callData": contractCallData,
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
        appData: formattedAppData,
        appDataHash: hashedAppData,
    };

    const { quote } = await orderBookApi.getQuote(quoteRequest);
    
    // Use the original sellAmount, which is equal to quoted sellAmount added to quoted feeAmount
    // sellAmount === BigNumber.from(quote.sellAmount).add(BigNumber.from(quote.feeAmount)).toString()

    const feeAmount = "0";

    const order: UnsignedOrder = {
      ...quote,
      sellAmount,
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

    // const orderToHash: Order = {
    //     sellToken: quote.sellToken,
    //     buyToken: quote.buyToken,
    //     sellAmount: sellAmount,
    //     buyAmount: quote.buyAmount,
    //     validTo: quote.validTo,
    //     appData: quote.appData,
    //     feeAmount: feeAmount,
    //     kind: quote.kind,
    //     partiallyFillable: quote.partiallyFillable,
    //     sellTokenBalance: OrderBalance.ERC20,
    //     buyTokenBalance: OrderBalance.ERC20,
    //   };

    // const digest = hashOrder(domain(ARBITRUM_ONE_CHAIN_ID, ARBITRUM_ONE_SETTELMENT_CONTRACT), orderToHash);

    // return {
    //     order:order,
    //     orderDigest:digest
    // };
}