
import {ApolloClient, gql, InMemoryCache} from "@apollo/client";

const client = new ApolloClient({
    uri: "",
    cache: new InMemoryCache(),
  });
  
  const GET_LOCATIONS = gql`
  query GetTrades($order_by: String, $order_direction: String, $skip: Int) {
      user(id: "0x8180822b1b58d72369f6aa191f7eff39d60d20d0") {
          ordersPlaced(orderBy: $order_by, orderDirection: $order_direction, skip: $skip, first: 50) {
            id
            tradesTimestamp
          }
      }
  }
  `;

  const GET_LOCATIONS_2 = gql`
query GetTrades($order_by: String, $order_direction: String, $skip: Int) {
  tradeCompleteds (orderBy: $order_by, orderDirection: $order_direction, skip: $skip, first: 50) {
    id
    amountIn
    amountOut
    tokenIn
    tokenOut
    blockTimestamp
  }
}
  `;

  export const getTrades = async (
    order_by: string,
    order_direction: string,
    skip: number,
  ) => {

    const client = new ApolloClient({
        uri: "https://gateway.thegraph.com/api/3885f2e61d65662a2abd7df2e982c84c/subgraphs/id/CQ8g2uJCjdAkUSNkVbd9oqqRP2GALKu1jJCD3fyY5tdc",
        cache: new InMemoryCache(),
      });
    const result = await client.query({
      query: GET_LOCATIONS,
      variables: { order_by: 'tradesTimestamp', order_direction: order_direction, skip: skip},
    });

    const client2 = new ApolloClient({
        uri: "https://api.studio.thegraph.com/query/94952/fund-manager/version/latest",
        cache: new InMemoryCache(),
      });
    const result2 = await client2.query({
        query: GET_LOCATIONS_2,
        variables: { order_by: order_by, order_direction: order_direction, skip: skip},
      });

      const combined = result2.data.tradeCompleteds.map((obj:any, index:number) => {
        return { ...obj, ...result.data.user.ordersPlaced[index] };
      });

    return {
      orders: combined,
    };
  }