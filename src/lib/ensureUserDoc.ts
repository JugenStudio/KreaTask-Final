
'use server';

import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "./types";
import { UserRole } from "./types";
import { getUser, createUser } from "@/app/actions/db";

/**
 * Ensures a user document exists in our database.
 * If it doesn't exist, it creates one with default values.
 * This is a server action.
 * @param firebaseUser The user object from Firebase Auth.
 */
export async function ensureUserDoc(firebaseUser: FirebaseUser) {
  const existingUser = await getUser(firebaseUser.uid);

  if (!existingUser) {
    const newUser: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "User Baru",
      email: firebaseUser.email || "",
      avatarUrl:
        firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
      role: UserRole.UNASSIGNED,
      jabatan: "Unassigned",
    };

    await createUser(newUser);
  }
}
