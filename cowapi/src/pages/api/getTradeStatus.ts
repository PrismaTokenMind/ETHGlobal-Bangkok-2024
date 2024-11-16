import type { NextApiRequest, NextApiResponse } from "next";
import { run } from "@/cowUtils/getTradeStatus";

type Data = {
    orderId?: string;
    error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>,
) {
    const data = await run();
    res.status(200).json( data );
}
