// pages/api/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from 'path';
import { promises as pfs } from 'fs';


type VerifyData = {
    sent?: string;
    recv?: string;
    time?: number;
    error?: string;
};

// ignore the error for now
// @ts-ignore
import { verify } from 'rust_verifier';

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyData>) {

      const modulePath = path.resolve(process.cwd(), 'rust_verifier/index.node');
        const myModule = await pfs.readFile(modulePath);

    if (req.method === "POST") {
        const { proof } = req.body;

        // Read the notary public key from the file
        const notaryKeyPath = path.join(process.cwd(), "assets", "notary.pub");
        const notaryKey = fs.readFileSync(notaryKeyPath, "utf8");

        try {
            const result = verify(proof, notaryKey);
            res.status(200).json({
                sent: result.sent,
                recv: result.recv,
                time: result.time,
            });
        } catch (error) {
            console.error("Verification error:", error);
            res.status(500).json({ error: "Verification failed" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}