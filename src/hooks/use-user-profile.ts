"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";
import { DIETARY_PREFERENCES } from "@/lib/constants";

const defaultProfile: UserProfile = {
  name: "Guest",
  dietaryPreferences: DIETARY_PREFERENCES[0],
  allergies: "",
  calorieTarget: 2000,
};

const USER_PROFILE_STORAGE_KEY = "nutriGeniusUserProfile";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (item) {
        setProfile(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading user profile from localStorage:`, error);
      // Fallback to default if stored data is corrupted
      setProfile(defaultProfile);
    }
    setIsLoaded(true);
  }, []);

  const updateUserProfile = useCallback((newProfileData: Partial<UserProfile>) => {
    setProfile((currentProfile) => {
      const updatedProfile = { ...currentProfile, ...newProfileData };
      try {
        window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      } catch (error) {
        console.error(`Error saving user profile to localStorage:`, error);
      }
      return updatedProfile;
    });
  }, []);

  return { profile, updateUserProfile, isLoaded };
};
