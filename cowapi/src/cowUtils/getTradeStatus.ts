import { SupportedChainId, OrderBookApi } from '@cowprotocol/cow-sdk'

export async function run(): Promise<unknown> {

    const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.ARBITRUM_ONE });

    const orderUid = '0x319f00efd618c10b89517f010614e962800044bdc757c17014940b0359d0d5ef7b25256cc8a4b36803d7b6bd4d28677c59d7a71867372a41';

    try {
        const order = await orderBookApi.getOrder(orderUid);
        const trades = await orderBookApi.getTrades({ orderUid });

        return {
            order,
            trades
        }
    } catch (e) {
        return e;
    }

}