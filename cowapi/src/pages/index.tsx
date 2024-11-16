import { StakeButton } from "@/components/StakeButton";
import { useState } from "react";
import TradesTable from "@/components/TradesTable";
import LimitOrdersTable from "@/components/LimitOrdersTable";
import StatsTable from "@/components/StatsTable";

export default function Home() {
  const [tokenAmount, setTokenAmount] = useState("");  


  const handleChange = (event:any) => {
    const inputValue = event.target.value;

    // Allow only numbers, a single decimal point, or an empty string
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setTokenAmount(inputValue);
    }
  };

  return (
      <main className="flex flex-col w-full h-screen">
        <div className="flex flex-row pt-16 px-6 h-full">
          <div className="flex flex-col justify-between w-2/3">
            <StatsTable />
            <TradesTable />
            <LimitOrdersTable />
          </div>
          <div className="flex flex-col w-1/3 justify-center items-center gap-3">
            <p>Deposit/Withdraw USDC to the fund</p>
              <input
                type="text" // Use "text" for flexible input (avoids browser validation quirks)
                value={tokenAmount}
                onChange={handleChange}
              />
              <StakeButton
                tokenAmount={tokenAmount}
              />
          </div>          
        </div>
      </main>
  );
}
