import { formatUnits } from 'viem';
import { useToken } from 'wagmi'
import { getTrades } from '@/hooks/getOrderData';
import React, { useEffect, useState } from 'react';
import ProofsModal from "@/components/ProofsModal";


export default function TradesTable() {
    const [trades, setTrades] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

        const [selectedProofs, setSelectedProofs] = useState<string[] | null>(null);

    const handleIconClick = (proofs: string[]) => {
        setSelectedProofs(proofs);
        console.log("Selected proofs:", proofs); // Check if proofs are correctly passed
    };

    const closeModal = () => {
        setSelectedProofs(null);
    };

    function checkProofsStatus(proofs: string[]) {
        return proofs.some(proof => proof.includes("Error")) ? "⛔️" : "✅";
    }
  
    const getData = async () => {
      const tradeResult = await getTrades('blockTimestamp', 'desc', 0);
      setTrades(tradeResult.orders)
    }

    useEffect(() => {
      setLoading(true)
      getData()
      setLoading(false)
    }, [])
  
    return (
        <div>
                        <h1 className="text-4xl font-bold">Agent Trades</h1>
            <div className="overflow-x-auto mt-3 w-full">
              {
                loading
                ? <div className='flex w-full justify-center items-center'>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
                :               <table className="table">
                <thead>
                <tr>
                    <th>Token Bought</th>
                    <th>Amount</th>
                    <th>Price (USDC)</th>
                    <th>Date</th>
                    <th>Link</th>
                    <th>Proofs</th>
                </tr>
                </thead>
                        <tbody>
                  { trades?.map(({ blockTimestamp, amountIn, amountOut, tokenIn, tokenOut, id }:{blockTimestamp:any, amountIn:any, amountOut:any, tokenIn:any, tokenOut:any, id:any}) => {
                    const date = new Date(blockTimestamp * 1000)
                    // const tokenInfo = useToken({address: tokenOut})
                    const decimals = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase() === (tokenOut as string).toLowerCase() ? 6 : 18;

                    // TODO - Temporary placeholder for proofs; replace this with actual proofs data from your backend if available. Get from the `limitOrderCreateds?.map`
                    const rowProofs = ["Proof 1", "Proof 2", "Proof 3"];

                    return(
                        <tr key={blockTimestamp}>
                            <td>{tokenOut}</td>
                            <td>{formatUnits(amountOut, decimals)}</td>
                            <th>${(amountIn / amountOut).toFixed(3)}</th>
                            <td>{date.toDateString()}</td>
                            <td><a href={`https://explorer.cow.fi/arb1/orders/${id}?tab=overview`}
                                   target='_blank'>Link</a></td>
                            <td onClick={() => handleIconClick(rowProofs)} style={{cursor: 'pointer'}}>
                                {checkProofsStatus(rowProofs)}
                            </td>
                        </tr>
                    )
                  })
                  }
                </tbody>
                    </table>
              }
            </div>


            {selectedProofs && (
                <ProofsModal _proofs={selectedProofs} onClose={closeModal} />
            )}
        </div>
    )
}