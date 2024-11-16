import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { FUND_MANAGER_CONTRACT } from "../contracts/FundManager";
import { TOKEN_CONTRACT } from "../contracts/TokenConract";
import { parseEther, parseUnits } from "viem";
import { useEffect } from "react";
import { toast } from "react-toastify";


export const StakeButton = ({
    tokenAmount,
}:{
    tokenAmount: string,
}) => {
    const { data: txHash, writeContract, isPending, error } = useWriteContract();

    const notify = (input: string) => toast(input);

    const withdraw = async () => {
        await writeContract({
            ...FUND_MANAGER_CONTRACT,
            functionName: 'withdraw',
            args: [parseUnits(tokenAmount, 18)],
        });
    }

    const deposit = async () => {
        await writeContract({
            ...FUND_MANAGER_CONTRACT,
            functionName: 'deposit',
            args: [parseUnits(tokenAmount, 6)],
        });
    }

    const approveTokens = async () => {
        await writeContract({
            ...TOKEN_CONTRACT,
            address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
            functionName: 'approve',
            args: [FUND_MANAGER_CONTRACT.address, parseUnits(tokenAmount, 6)],
        });
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash })

    useEffect(() => {
        if (error) {
            let errorTitle: string;
            let errorMessage: string;
            console.log(error.message)
            if (error.message.includes('Already staked for this task')) {
                errorTitle = 'Failed to stake';
                errorMessage = 'This address already staked for this task';
            } else {
                errorTitle = 'Failed to stake';
                errorMessage = 'An error occurred while staking';
            }
            notify(errorMessage);
        }
    }, [error]);

    useEffect(() => {
        if (isConfirming) {
            notify('Confirming transaction');
        }
    }, [isConfirming])

    useEffect(() => {
        if (isConfirmed) {
            notify('Transaction confirmed');
        }
    }, [isConfirmed])

    return (
        <div className="flex flex-row gap-4">
            <button
                disabled={isPending}
                onClick={()=> approveTokens()}
                className="btn"
            >
                {isPending ?
                    'Confirming...'
                    :
                    'Approve USDC'
                }
            </button>   
            <button
                disabled={isPending}
                onClick={()=> deposit()}
                className="btn"
            >
                {isPending ?
                    'Confirming...'
                    :
                    'Deposit USDC'
                }
            </button>
            <button
                disabled={isPending}
                onClick={()=> withdraw()}
                className="btn"
            >
                {isPending ?
                    'Confirming...'
                    :
                    'Withdraw USDC'
                }
            </button>              
        </div>
    );
};

