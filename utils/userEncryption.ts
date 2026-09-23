import CryptoJS from "crypto-js";
import { COLLECTION_BOOKS, COLLECTION_USERS } from "./consts";
import {
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { decrypt } from "./encrypt";
import { isNull } from "es-toolkit";

const sessionKeyCache = new Map<string, string>();

export const PREFIX_V2_50K = "v2:50k:";
export const PREFIX_V2_600K = "v2:";
export const DEFAULT_PBKDF2_ITERATIONS = 50000;
export const LEGACY_PBKDF2_ITERATIONS = 600000;

/**
 * Gets or creates a 16-byte hex salt for a user, then derives a 256-bit PBKDF2 key.
 * Caches the derived key in memory for zero-latency subsequent operations during the session.
 */
export async function getOrCreateUserKey(
  UID: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<string> {
  if (!UID) return "";
  const cacheKey = `${UID}:${iterations}`;
  if (sessionKeyCache.has(cacheKey)) {
    return sessionKeyCache.get(cacheKey)!;
  }

  const userRef = doc(COLLECTION_USERS, UID);
  let salt = "";

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data()?.salt) {
      salt = userSnap.data().salt;
    } else {
      // Generate a cryptographically secure 16-byte salt
      const array = new Uint8Array(16);
      if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(array);
      } else {
        for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
      }
      salt = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

      await setDoc(
        userRef,
        {
          salt,
          createdAt: new Date().toISOString(),
          migrationStatus: {
            complete: false,
            migratedNotes: 0,
            totalNotes: 0,
          },
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("[userEncryption] Error fetching/setting user salt:", err);
    salt = CryptoJS.SHA256(UID).toString();
  }

  const derivedKey = CryptoJS.PBKDF2(UID, salt, {
    keySize: 256 / 32,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  }).toString();

  sessionKeyCache.set(cacheKey, derivedKey);
  return derivedKey;
}

/**
 * Encrypts data using user-specific derived key with 50,000 iterations (v2:50k: format).
 */
export function encryptDataV2(data: unknown, userKey: string): string {
  if (isNull(data) || data === "") return "";
  const stringData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(stringData, userKey).toString();
  return `${PREFIX_V2_50K}${encrypted}`;
}

/**
 * Decrypts data. Supports v2:50k: (50k key), v2: (legacy 600k key), and v1 (Rabbit DECRYPT key).
 */
export async function decryptDataV2(
  data: unknown,
  userKey50k: string,
  UID?: string
): Promise<unknown> {
  if (isNull(data) || typeof data !== "string" || data.trim() === "") return null;

  // 1. Check for new 50k versioned prefix
  if (data.startsWith(PREFIX_V2_50K)) {
    try {
      const ciphertext = data.slice(PREFIX_V2_50K.length);
      const bytes = CryptoJS.AES.decrypt(ciphertext, userKey50k);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) return data;
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (err) {
      console.error("[userEncryption] Error decrypting v2:50k note:", err);
      return data;
    }
  }

  // 2. Check for legacy 600k v2: prefix
  if (data.startsWith(PREFIX_V2_600K)) {
    try {
      const ciphertext = data.slice(PREFIX_V2_600K.length);
      const userKey600k = UID
        ? await getOrCreateUserKey(UID, LEGACY_PBKDF2_ITERATIONS)
        : userKey50k;
      const bytes = CryptoJS.AES.decrypt(ciphertext, userKey600k);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) return data;
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (err) {
      console.error("[userEncryption] Error decrypting legacy v2:600k note:", err);
      return data;
    }
  }

  // 3. Fallback to legacy v1 Rabbit decrypt (via server API endpoint so DECRYPT is never exposed to client)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/decrypt-v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.decrypted;
      }
    } catch (err) {
      console.error("[userEncryption] Error calling /api/decrypt-v1:", err);
    }
  }
  return decrypt(data);
}

/**
 * Resumable deferred background batch migration of legacy notes to v2:50k: format.
 * Uses requestIdleCallback / setTimeout spacing to prevent thread contention.
 */
export async function runResumableNotesMigration(
  UID: string,
  onProgress?: (migrated: number, total: number) => void
): Promise<void> {
  if (!UID) return;

  // Schedule background migration during idle time (2s delay minimum)
  const scheduleIdle = typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 3000 })
    : (cb: () => void) => setTimeout(cb, 2500);

  scheduleIdle(async () => {
    try {
      const userRef = doc(COLLECTION_USERS, UID);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData?.migrationStatus?.completeV50k) {
        // Already 100% migrated to 50k version
        return;
      }

      // Pre-derive 50k key (or fetch from cache)
      const userKey50k = await getOrCreateUserKey(UID, DEFAULT_PBKDF2_ITERATIONS);

      // Query books for this user
      const q = query(COLLECTION_BOOKS, where("owner", "==", UID));
      const querySnap = await getDocs(q);

      // Filter books with unmigrated notes (does not start with v2:50k:)
      const unmigratedDocs = querySnap.docs.filter((d) => {
        const notes = d.data()?.notes;
        return typeof notes === "string" && notes.length > 0 && !notes.startsWith(PREFIX_V2_50K);
      });

      const totalNotes = unmigratedDocs.length;
      if (totalNotes === 0) {
        await setDoc(
          userRef,
          {
            migrationStatus: {
              completeV50k: true,
              totalNotes: 0,
              migratedNotes: 0,
              completedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
        return;
      }

      let migratedNotes = 0;
      const BATCH_SIZE = 5;

      for (let i = 0; i < unmigratedDocs.length; i += BATCH_SIZE) {
        const chunk = unmigratedDocs.slice(i, i + BATCH_SIZE);

        await Promise.all(
          chunk.map(async (docSnap) => {
            try {
              const rawNotes = docSnap.data().notes;
              // Decrypt using decryptDataV2 (handles 600k v2:, Rabbit, or plain text)
              const decryptedContent = await decryptDataV2(rawNotes, userKey50k, UID);
              if (decryptedContent !== null && decryptedContent !== undefined) {
                // Re-encrypt using 50k key
                const encryptedV2_50k = encryptDataV2(decryptedContent, userKey50k);
                await updateDoc(docSnap.ref, { notes: encryptedV2_50k });
              }
            } catch (docErr) {
              console.error(`[userEncryption] Failed to migrate note for book ${docSnap.id}:`, docErr);
            }
          })
        );

        migratedNotes += chunk.length;
        if (onProgress) onProgress(migratedNotes, totalNotes);

        // Save progress
        await setDoc(
          userRef,
          {
            migrationStatus: {
              completeV50k: migratedNotes >= totalNotes,
              totalNotes,
              migratedNotes,
              updatedAt: new Date().toISOString(),
              ...(migratedNotes >= totalNotes ? { completedAt: new Date().toISOString() } : {}),
            },
          },
          { merge: true }
        );

        // Space out batches to yield main thread
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } catch (err) {
      console.error("[userEncryption] Background migration error:", err);
    }
  });
}

