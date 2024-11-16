import type { NextApiRequest, NextApiResponse } from "next";
import { LimitOrderInputDataSchema, setLimitOrder } from "@/cowUtils/setLimitOrder";

type Data = {
    orderId?: string;
    error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    const limitOrderInputData: LimitOrderInputDataSchema = req.body;

    try {
        const data = await setLimitOrder(limitOrderInputData);
        res.status(200).json( data );

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error" });
    }
}
