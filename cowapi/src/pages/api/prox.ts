// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
    tokenValue: number;
    pnl: number;
    absoluteProfit: number;
};

async function httpCall2() {

    const url = "https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/current_value?addresses=0x8180822B1B58D72369f6aa191F7EFf39d60d20d0&chain_id=42161";

    let token_value = 0;
      try {        
        const data = await fetch(url, {
          headers: { Authorization: `Bearer 4jpY7HQ8Jz9Fid5nFnkGQSeWk1V1ZTbR` }
        }).then((res) => res.json());
        token_value = data.result?.slice(1)?.reduce((acc: any, curr: any) => acc + Number(curr.result[0].value_usd), 0);
      } catch (error) {
        console.error(error);
      }

      const url2 = "https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/profit_and_loss?addresses=0x8180822B1B58D72369f6aa191F7EFf39d60d20d0&chain_id=42161";
        let pnl = 0;
        let absoluteProfit = 0;
        try {        
            const data = await fetch(url2, {
              headers: { Authorization: `Bearer 4jpY7HQ8Jz9Fid5nFnkGQSeWk1V1ZTbR` }
            }).then((res) => res.json());
            pnl = data.result[0].roi;
            absoluteProfit = data.result[0].abs_profit_usd;
          } catch (error) {
            console.error(error);
          }
    return { tokenValue: token_value, pnl: pnl, absoluteProfit: absoluteProfit };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    const result = await httpCall2();
  res.status(200).json( result );
}
