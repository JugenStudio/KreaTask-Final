
"use client";

import { useCallback } from 'react';
import { useTaskData } from './use-task-data';
import type { User } from '@/lib/types';


export function useAuthActions() {
  const { updateUserInFirestore, users, currentUserData } = useTaskData();

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; email?: string; avatarUrl?: string }) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    
    // This will be replaced with a server action to update the user in the database
    await updateUserInFirestore(userId, data);

  }, [currentUserData, updateUserInFirestore]);

  const updateUserEmail = useCallback(async (newEmail: string) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    // This will be a server action
    console.log(`Email updated to ${newEmail}`);
  }, [currentUserData]);

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!currentUserData || !currentUserData.email) throw new Error("Pengguna tidak terautentikasi atau tidak memiliki email.");
    // This will be a server action
    console.log('Password changed successfully');

  }, [currentUserData]);

  const uploadProfilePicture = useCallback(async (file: File) => {
    if (!currentUserData) throw new Error("Pengguna tidak terautentikasi.");
    
    // Mock uploading and getting a URL. In a real app, you'd upload to a service like S3 or Cloud Storage.
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
