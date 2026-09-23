import { Rabbit, enc } from "crypto-js";
import { isNull } from "es-toolkit";

const key = process.env.DECRYPT as string;

function decrypt(data: unknown): unknown {
  if (isNull(data) || typeof data !== "string" || data.trim() === "") return null;
  try {
    const bytes = Rabbit.decrypt(data, key);
    const decryptedData: string = bytes.toString(enc.Utf8);
    if (!decryptedData) {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    try {
      return JSON.parse(decryptedData);
    } catch {
      return decryptedData;
    }
  } catch {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}

function encrypt(data: unknown): string {
  const stringData: string = JSON.stringify(data);
  return Rabbit.encrypt(stringData, key).toString();
}

export { decrypt, encrypt };
