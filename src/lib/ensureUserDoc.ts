
import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "./types";
import { UserRole } from "./types";

/**
 * Memastikan dokumen user sudah ada di koleksi "users".
 * Jika belum ada, otomatis membuat dengan data default.
 * @param firestore Instance dari Firestore.
 * @param user Objek pengguna dari Firebase Auth.
 * @param defaultRole Peran default untuk pengguna baru.
 * @returns Promise yang resolve ke DocumentReference dari dokumen pengguna.
 */
export async function ensureUserDoc(
  firestore: Firestore,
  user: FirebaseUser,
  defaultRole: UserRole = UserRole.UNASSIGNED
) {
  const userRef = doc(firestore, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser: User = {
      id: user.uid,
      name: user.displayName || "User Baru",
      email: user.email || "",
      avatarUrl:
        user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
      role: defaultRole,
      jabatan: "Unassigned",
    };

    await setDoc(userRef, newUser);
  }

  return userRef;
}
