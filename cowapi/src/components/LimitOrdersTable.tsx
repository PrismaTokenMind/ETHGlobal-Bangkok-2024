import { useQuery, gql } from '@apollo/client';
import { formatUnits } from 'viem';
import { useToken } from 'wagmi'

const GET_LOCATIONS = gql`
query GetTrades {
  limitOrderCreateds(orderBy: blockTimestamp, orderDirection: desc) {
    amountIn
    amountOut
    blockTimestamp
    tokenOut
    tokenIn
  }
}
`;

export default function LimitOrdersTable() {
    // const [tokenAmount, setTokenAmount] = useState(0);
  
    const { loading, error, data } = useQuery(GET_LOCATIONS);
  
    return (
        <div>
                        <h1 className="text-4xl font-bold">Open Limit Orders</h1>
            <div className="overflow-x-auto mt-3 w-full">
              {
                loading
                ? <div className='flex w-full justify-center items-center'>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
                :               <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Amount</th>
                    <th>Price (USDC)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  { data?.limitOrderCreateds?.map(({ blockTimestamp, amountIn, amountOut, tokenIn, tokenOut }:{blockTimestamp:any, amountIn:any, amountOut:any, tokenIn:any, tokenOut:any}) => {
                    const date = new Date(blockTimestamp * 1000)
                    // const tokenInfo = useToken({address: tokenOut})
                    const decimals = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase() === (tokenOut as string).toLowerCase() ? 6 : 18;
                    return(
                        <tr key={blockTimestamp}>
                            {/* <td>{tokenInfo.data?.symbol}</td> */}
                            <td>{tokenOut}</td>
                            <td>{formatUnits(amountOut, decimals)}</td>
                            <th>${(amountIn/amountOut).toFixed(3)}</th>
                            <td>{date.toDateString()}</td>
                        </tr>
                    )})
                  }
                </tbody>
              </table>
              }
            </div>
        </div>
    )
}