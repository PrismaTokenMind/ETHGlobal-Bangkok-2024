import { useQuery, gql } from '@apollo/client';
import { formatUnits } from 'viem';
import { useToken } from 'wagmi'
import { useEffect, useState } from 'react';

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
    const [pnl, setPnl] = useState(0);
    const [absoluteProfit, setAbsoluteProfit] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);


    const { loading, error, data } = useQuery(GET_LOCATIONS);

  async function httpCall() {

      try {        
        const data = await fetch('/api/prox').then((res) => res.json());
        console.log(data);
        setCurrentValue(data.tokenValue);
        setPnl(data.pnl);
        setAbsoluteProfit(data.absoluteProfit);
      } catch (error) {
        console.error(error);
      }
  }

    useEffect(() => {
      httpCall();
    }, []);
  
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
                <div className='grid grid-cols-3 gap-3'>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Total deposited balance: {formatUnits(data?.botSummary.depositBalance, 6)} USDC
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Number of trades: {data?.botSummary.numberOfTrades}
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Traded USDC volume: {Number(formatUnits(data?.botSummary.tradedUSDC, 18)).toFixed(3)} USDC
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Agent PnL: {pnl?.toFixed(3)} %
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Absolute profit: {absoluteProfit?.toFixed(3)} USDC
                    </div>
                    <div className='flex p-4 items-center justify-center text-center'>
                        Portfolio Value: {currentValue?.toFixed(3)} USDC
                    </div>
                </div>
              }
            </div>
        </div>
    )
}