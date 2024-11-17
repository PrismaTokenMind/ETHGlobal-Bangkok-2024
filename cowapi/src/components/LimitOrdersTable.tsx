import { useQuery, gql } from '@apollo/client';
import { formatUnits } from 'viem';
import React, { useState } from "react";
import ProofsModal from "@/components/ProofsModal";

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
                : <table className="table">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Amount</th>
                        <th>Price (USDC)</th>
                        <th>Date</th>
                        <th>Proofs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.limitOrderCreateds?.map(({ blockTimestamp, amountIn, amountOut, tokenIn, tokenOut }:{blockTimestamp:any, amountIn:any, amountOut:any, tokenIn:any, tokenOut:any}) => {
                        const date = new Date(blockTimestamp * 1000);
                        const decimals = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase() === tokenOut.toLowerCase() ? 6 : 18;

                        // TODO - Temporary placeholder for proofs; replace this with actual proofs data from your backend if available. Get from the `limitOrderCreateds?.map`
                        const rowProofs = ["Proof 1", "Proof 2", "Proof 3"];

                        return (
                          <tr key={blockTimestamp}>
                            <td>{tokenOut}</td>
                            <td>{formatUnits(amountOut, decimals)}</td>
                            <th>${(amountIn / amountOut).toFixed(3)}</th>
                            <td>{date.toDateString()}</td>
                            <td onClick={() => handleIconClick(rowProofs)} style={{ cursor: 'pointer' }}>
                              {checkProofsStatus(rowProofs)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              }
            </div>

            {selectedProofs && (
                <ProofsModal _proofs={selectedProofs} onClose={closeModal} />
            )}
        </div>
    );
}