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
const MIGRATION_PREFIX = "v2:";
const PBKDF2_ITERATIONS = 600000;

/**
 * Gets or creates a 16-byte hex salt for a user, then derives a 256-bit PBKDF2 key.
 * Caches the derived key in memory for zero-latency subsequent operations during the session.
 */
export async function getOrCreateUserKey(UID: string): Promise<string> {
  if (!UID) return "";
  if (sessionKeyCache.has(UID)) {
    return sessionKeyCache.get(UID)!;
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
    // Fallback salt derived from UID if network fails for salt fetch
    salt = CryptoJS.SHA256(UID).toString();
  }

  // Derive key using PBKDF2 with 600,000 iterations (OWASP standard)
  const derivedKey = CryptoJS.PBKDF2(UID, salt, {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  }).toString();

  sessionKeyCache.set(UID, derivedKey);
  return derivedKey;
}

/**
 * Encrypts data using user-specific derived key (v2 format with prefix).
 */
export function encryptDataV2(data: unknown, userKey: string): string {
  if (isNull(data) || data === "") return "";
  const stringData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(stringData, userKey).toString();
  return `${MIGRATION_PREFIX}${encrypted}`;
}

/**
 * Decrypts data. Supports v2 (user key) and v1 (legacy DECRYPT key) formats.
 */
export function decryptDataV2(data: unknown, userKey: string): unknown {
  if (isNull(data) || typeof data !== "string" || data.trim() === "") return null;

  if (data.startsWith(MIGRATION_PREFIX)) {
    try {
      const ciphertext = data.slice(MIGRATION_PREFIX.length);
      const bytes = CryptoJS.AES.decrypt(ciphertext, userKey);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedStr) return data;
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (err) {
      console.error("[userEncryption] Error decrypting v2 note:", err);
      return data;
    }
  } else {
    // Fallback to legacy v1 decrypt
    return decrypt(data);
  }
}

/**
 * Resumable background batch migration of legacy notes to v2 format.
 * Updates migrationStatus in lymbrarie_users/{UID}.
 */
export async function runResumableNotesMigration(
  UID: string,
  onProgress?: (migrated: number, total: number) => void
): Promise<void> {
  if (!UID) return;

  try {
    const userRef = doc(COLLECTION_USERS, UID);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData?.migrationStatus?.complete) {
      // Already 100% migrated
      return;
    }

    const userKey = await getOrCreateUserKey(UID);

    // Query books for this user
    const q = query(COLLECTION_BOOKS, where("owner", "==", UID));
    const querySnap = await getDocs(q);

    // Filter books with unmigrated notes (has notes string that doesn't start with v2:)
    const unmigratedDocs = querySnap.docs.filter((d) => {
      const notes = d.data()?.notes;
      return typeof notes === "string" && notes.length > 0 && !notes.startsWith(MIGRATION_PREFIX);
    });

    const totalNotes = unmigratedDocs.length;
    if (totalNotes === 0) {
      await setDoc(
        userRef,
        {
          migrationStatus: {
            complete: true,
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
            // Decrypt legacy note safely (handles Rabbit encryption or plain text HTML)
            const decryptedContent = decrypt(rawNotes);
            if (decryptedContent !== null && decryptedContent !== undefined) {
              // Re-encrypt using v2 key
              const encryptedV2 = encryptDataV2(decryptedContent, userKey);
              await updateDoc(docSnap.ref, { notes: encryptedV2 });
            }
          } catch (docErr) {
            console.error(`[userEncryption] Failed to migrate note for book ${docSnap.id}:`, docErr);
          }
        })
      );

      migratedNotes += chunk.length;
      if (onProgress) onProgress(migratedNotes, totalNotes);

      // Save progress to Firestore user profile
      await setDoc(
        userRef,
        {
          migrationStatus: {
            complete: migratedNotes >= totalNotes,
            totalNotes,
            migratedNotes,
            updatedAt: new Date().toISOString(),
            ...(migratedNotes >= totalNotes ? { completedAt: new Date().toISOString() } : {}),
          },
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("[userEncryption] Background migration error:", err);
  }
}
