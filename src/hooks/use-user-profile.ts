
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";
import { DIETARY_PREFERENCES } from "@/lib/constants";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const defaultProfile: UserProfile = {
  name: "Guest",
  dietaryPreferences: DIETARY_PREFERENCES[0],
  allergies: "",
  calorieTarget: 2000,
};

// Assuming a fixed user ID for now. In a real app, this would be dynamic.
const USER_ID = "anonymousUser";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, "userProfiles", USER_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // If no profile exists, create a default one in Firestore
        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
      setIsLoaded(true);
    };

    fetchProfile().catch(console.error);
  }, []);

  const updateUserProfile = useCallback(async (newProfileData: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...newProfileData };
    try {
      const docRef = doc(db, "userProfiles", USER_ID);
      await setDoc(docRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
    } catch (error) {
      console.error(`Error saving user profile to Firestore:`, error);
    }
  }, [profile]);

  return { profile, updateUserProfile, isLoaded };
};
