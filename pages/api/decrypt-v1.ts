import type { NextApiRequest, NextApiResponse } from "next";
import { Rabbit, enc } from "crypto-js";
import { isNull } from "es-toolkit";

const key = process.env.DECRYPT as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data } = req.body || {};
  if (isNull(data) || typeof data !== "string" || data.trim() === "") {
    return res.status(400).json({ error: "Invalid data parameter" });
  }

  if (!key) {
    console.error("[decrypt-v1] DECRYPT environment variable is not set");
    return res.status(500).json({ error: "Decryption service misconfigured" });
  }

  try {
    const bytes = Rabbit.decrypt(data, key);
    const decryptedData: string = bytes.toString(enc.Utf8);
    if (!decryptedData) {
      try {
        return res.status(200).json({ decrypted: JSON.parse(data) });
      } catch {
        return res.status(200).json({ decrypted: data });
      }
    }
    try {
      return res.status(200).json({ decrypted: JSON.parse(decryptedData) });
    } catch {
      return res.status(200).json({ decrypted: decryptedData });
    }
  } catch (err: any) {
    try {
      return res.status(200).json({ decrypted: JSON.parse(data) });
    } catch {
      return res.status(200).json({ decrypted: data });
    }
  }
}
