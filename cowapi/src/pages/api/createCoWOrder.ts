import type { NextApiRequest, NextApiResponse } from "next";
import { OrderInputDataSchema, getUnsignedOrderDigest } from "@/cowUtils/getOrder";

type Data = {
    orderId?: string;
    error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    const orderInputData: OrderInputDataSchema = req.body;

    try {
        const data = await getUnsignedOrderDigest(orderInputData);
        res.status(200).json( data );

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error" });
    }
}
