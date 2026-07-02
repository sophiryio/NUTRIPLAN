/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { UserProfile, MeasurementLog, DailyLog, WorkoutEntry } from '../types';

export interface FirestoreUserData {
  userId: string;
  profile: UserProfile;
  measurements: MeasurementLog[];
  dailyLogs: DailyLog[];
  workouts: WorkoutEntry[];
  updatedAt: string;
}

/**
 * Saves all user progress data to firestore.
 */
export const saveUserDataToCloud = async (
  userId: string,
  profile: UserProfile,
  measurements: MeasurementLog[],
  dailyLogs: DailyLog[],
  workouts: WorkoutEntry[]
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  const payload: FirestoreUserData = {
    userId,
    profile,
    measurements,
    dailyLogs,
    workouts,
    updatedAt: new Date().toISOString()
  };
  await setDoc(userDocRef, payload);
};

/**
 * Fetches user data from cloud. Returns null if no document exists.
 */
export const loadUserDataFromCloud = async (userId: string): Promise<FirestoreUserData | null> => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as FirestoreUserData;
  }
  return null;
};
