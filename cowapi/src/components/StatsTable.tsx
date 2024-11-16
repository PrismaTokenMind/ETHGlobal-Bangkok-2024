import { useQuery, gql } from '@apollo/client';
import { formatUnits } from 'viem';
import { useToken } from 'wagmi'

const GET_LOCATIONS = gql`
query GetTrades {
  botSummary(
    id: "0x307830303030303030303030303030303030303030303030303030303030303030303030303030303031"
  ) {
    depositBalance
    numberOfTrades
    pnl
    tradedUSDC
  }
}
`;

export default function StatsTable() {
  
    const { loading, error, data } = useQuery(GET_LOCATIONS);
  
    return (
        <div>
            <h1 className="text-4xl font-bold">Stats</h1>
            <div className="overflow-x-auto mt-3 w-full">
              {
                loading
                ? <div className='flex w-full justify-center items-center'>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
                :               
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Total deposited balance: {formatUnits(data?.botSummary.depositBalance, 6)} USDC
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Number of trades: {data?.botSummary.numberOfTrades}
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Traded USDC volume: {Number(formatUnits(data?.botSummary.tradedUSDC, 18)).toFixed(3)} USDC
                    </div>
                </div>
              }
            </div>
        </div>
    )
}