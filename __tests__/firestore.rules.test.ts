import { readFileSync } from "fs";
import { resolve } from "path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { describe, beforeAll, afterAll, beforeEach, it } from "vitest";

const PROJECT_ID = "lymbrarie-test-project";
let testEnv: RulesTestEnvironment;

describe("Firestore Security Rules", () => {
  beforeAll(async () => {
    const rulesPath = resolve(__dirname, "../firestore.rules");
    const rules = readFileSync(rulesPath, "utf8");
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: "127.0.0.1",
        port: 8080,
        rules,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe("lymbrarie_books collection", () => {
    it("allows authenticated user to create a book when owner matches auth.uid", async () => {
      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const newBookRef = aliceDb.collection("lymbrarie_books").doc("book1");
      await assertSucceeds(
        newBookRef.set({ title: "Alice's Book", owner: "alice" })
      );
    });

    it("prevents user from creating a book assigned to another owner UID", async () => {
      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const newBookRef = aliceDb.collection("lymbrarie_books").doc("book1");
      await assertFails(
        newBookRef.set({ title: "Fake Book", owner: "bob" })
      );
    });

    it("allows owner to update their book while keeping owner unchanged", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection("lymbrarie_books")
          .doc("book1")
          .set({ title: "Original Title", owner: "alice" });
      });

      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const bookRef = aliceDb.collection("lymbrarie_books").doc("book1");
      await assertSucceeds(
        bookRef.update({ title: "Updated Title", owner: "alice" })
      );
    });

    it("PREVENTS owner from changing request.resource.data.owner on update", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection("lymbrarie_books")
          .doc("book1")
          .set({ title: "Original Title", owner: "alice" });
      });

      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const bookRef = aliceDb.collection("lymbrarie_books").doc("book1");
      await assertFails(
        bookRef.update({ title: "Transfer Book", owner: "bob" })
      );
    });

    it("prevents non-owner from reading, updating, or deleting another user's book", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection("lymbrarie_books")
          .doc("book1")
          .set({ title: "Alice's Private Book", owner: "alice" });
      });

      const bobDb = testEnv.authenticatedContext("bob").firestore();
      const bookRef = bobDb.collection("lymbrarie_books").doc("book1");

      await assertFails(bookRef.get());
      await assertFails(bookRef.update({ title: "Hacked" }));
      await assertFails(bookRef.delete());
    });
  });

  describe("lymbrarie_users collection", () => {
    it("allows user to read and write their own user profile document", async () => {
      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const userRef = aliceDb.collection("lymbrarie_users").doc("alice");
      await assertSucceeds(userRef.set({ salt: "12345678" }));
      await assertSucceeds(userRef.get());
    });

    it("prevents user from accessing another user's profile document", async () => {
      const aliceDb = testEnv.authenticatedContext("alice").firestore();
      const userRef = aliceDb.collection("lymbrarie_users").doc("bob");
      await assertFails(userRef.set({ salt: "hacked" }));
      await assertFails(userRef.get());
    });
  });

  describe("lymbrarie_suggestions collection", () => {
    it("allows anyone (unauthenticated or authenticated) to read suggestions", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const sugRef = unauthDb.collection("lymbrarie_suggestions").doc("sug1");
      await assertSucceeds(sugRef.get());
    });

    it("allows creating a valid suggestion with text up to 500 characters", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const sugRef = unauthDb.collection("lymbrarie_suggestions").doc("sug1");
      await assertSucceeds(sugRef.set({ text: "Great app!" }));
    });

    it("prevents creating a suggestion with text longer than 500 characters", async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const sugRef = unauthDb.collection("lymbrarie_suggestions").doc("sug2");
      await assertFails(sugRef.set({ text: "a".repeat(501) }));
    });

    it("prevents editing or deleting suggestions", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection("lymbrarie_suggestions")
          .doc("sug1")
          .set({ text: "Original" });
      });

      const unauthDb = testEnv.unauthenticatedContext().firestore();
      const sugRef = unauthDb.collection("lymbrarie_suggestions").doc("sug1");
      await assertFails(sugRef.update({ text: "Modified" }));
      await assertFails(sugRef.delete());
    });
  });
});
