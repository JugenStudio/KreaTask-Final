
"use client";

import { useCallback } from 'react';
// import { useAuth, useFirestore } from '@/firebase'; // Temporarily disabled
// import { 
//   updateProfile, 
//   updateEmail, 
//   reauthenticateWithCredential, 
//   EmailAuthProvider, 
//   updatePassword 
// } from 'firebase/auth';
// import { doc, updateDoc } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTaskData } from './use-task-data';
import type { User } from '@/lib/types';


export function useAuthActions() {
  // const auth = useAuth(); // Temporarily disabled
  // const firestore = useFirestore(); // Temporarily disabled
  const { updateUserInFirestore, users, currentUserData } = useTaskData();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; email?: string; avatarUrl?: string }) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    
    // Mock updating profile
    // await updateProfile(auth.currentUser, { // Temporarily disabled
    //   displayName: data.name,
    //   photoURL: data.avatarUrl,
    // });

    // Update "Firestore" (mock state)
    await updateUserInFirestore(userId, data);

  }, [currentUserData, updateUserInFirestore]);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    
    // Mock updating email
    // await updateEmail(auth.currentUser, newEmail); // Temporarily disabled
    console.log(`Email updated to ${newEmail}`);
  }, [currentUserData]);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!currentUserData || !currentUserData.email) throw new Error("Pengguna tidak terautentikasi atau tidak memiliki email.");
    
    // Mock changing password
    // const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword); // Temporarily disabled
    // await reauthenticateWithCredential(auth.currentUser, credential); // Temporarily disabled
    // await updatePassword(auth.currentUser, newPassword); // Temporarily disabled
    console.log('Password changed successfully');

  }, [currentUserData]);

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");

    // Mock uploading profile picture
    const downloadURL = URL.createObjectURL(file);

    // Update user profile
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
