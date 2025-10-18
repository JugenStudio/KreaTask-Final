
"use client";

import { useCallback } from 'react';
import { useTaskData } from './use-task-data';
import type { User } from '@/lib/types';
import { 
    useAuth as useFirebaseAuth,
    useFirestore as useFirebaseFirestore
} from './use-auth-actions-server';
import { updateProfile as firebaseUpdateProfile, updateEmail as firebaseUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

export function useAuthActions() {
  const { updateUserInFirestore } = useTaskData();
  const auth = useFirebaseAuth();
  const { currentUserData } = useTaskData();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; email?: string; avatarUrl?: string }) => {
    if (!auth.currentUser) throw new Error("Pengguna tidak terautentikasi.");
    
    const updates: { displayName?: string; photoURL?: string } = {};
    if (data.name) updates.displayName = data.name;
    if (data.avatarUrl) updates.photoURL = data.avatarUrl;

    if (Object.keys(updates).length > 0) {
        await firebaseUpdateProfile(auth.currentUser, updates);
    }
    
    await updateUserInFirestore(userId, data);
  }, [auth, updateUserInFirestore]);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    if (!auth.currentUser) throw new Error("Pengguna tidak terautentikasi.");
    await firebaseUpdateEmail(auth.currentUser, newEmail);
  }, [auth]);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error("Pengguna tidak terautentikasi atau tidak memiliki email.");
    
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);

  }, [auth]);

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    
    // This is a placeholder. In a real app, you'd upload to Firebase Storage
    // and get the download URL. For now, we use a blob URL.
    const downloadURL = URL.createObjectURL(file);

    await updateUserProfile(currentUserData.id, { avatarUrl: downloadURL });

    return downloadURL;
  }, [currentUserData, updateUserProfile]);


  return {
    updateUserProfile,
    updateUserEmail,
    changeUserPassword,
    uploadProfilePicture,
  };
}

    