/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HealthConditions {
  diabetes?: boolean;
  diabetesType?: 'type1' | 'type2' | 'prediabetes' | 'gestational';
  insulinResistance?: boolean;
  sop?: boolean; // Síndrome dos Ovários Policísticos
  hypertension?: boolean; // Hipertensão Arterial
  hypothyroidism?: boolean; // Hipotireoidismo
  hyperthyroidism?: boolean; // Hipertireoidismo
  cardiovascular?: boolean; // Problemas Cardiovasculares
  highCholesterol?: boolean; // Colesterol Alto / Triglicerídeos
  celiac?: boolean; // Doença Celíaca / Sensibilidade ao Glúten
  lactoseIntolerance?: boolean; // Intolerância à Lactose
  gastritisReflux?: boolean; // Gastrite / Refluxo
  kidneyIssues?: boolean; // Doença Renal / Cálculo Renal
  pregnancyLactation?: boolean; // Gestante / Lactante
  otherConditions?: string;
  medications?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  weight: number; // current weight in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
  formula: 'mifflin' | 'harris';
  targetWeight: number; // target weight in kg
  weeklyDeficitTarget: number; // e.g. 500 kcal
  proteinFactor: number; // g/kg, e.g. 2.0
  fatFactor: number; // g/kg, e.g. 0.9
  isManualMacros?: boolean;
  manualCalories?: number;
  manualProtein?: number;
  manualCarbs?: number;
  manualFat?: number;
  healthConditions?: HealthConditions;
  startDate?: string; // YYYY-MM-DD
  photoUrl?: string; // photo URL or base64 data url
  avatarGender?: 'male' | 'female' | 'nonbinary';
  avatarHairStyle?: 'short' | 'long' | 'curly' | 'bun' | 'bald';
  avatarHairColor?: string;
  avatarOutfitStyle?: 'athletic' | 'casual' | 'cozy';
  avatarOutfitColor?: string;
  avatarSkinColor?: string;
  avatarAccessory?: 'none' | 'glasses' | 'headphones' | 'cap';
  avatarExpression?: 'happy' | 'neutral' | 'motivated';
  avatarBeardStyle?: 'none' | 'short' | 'full';
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number; // kcal per 100g or unit
  protein: number; // g per 100g or unit
  carbs: number; // g per 100g or unit
  fat: number; // g per 100g or unit
  unit: 'g' | 'unit';
  defaultAmount: number; // e.g. 100
}

export interface MealFoodEntry {
  id: string;
  foodId: string;
  name: string;
  amount: number; // in g or units
  calories: number; // calculated
  protein: number; // calculated
  carbs: number; // calculated
  fat: number; // calculated
}

export interface Meal {
  id: string;
  name: string; // e.g., "Café da Manhã", "Almoço"
  entries: MealFoodEntry[];
  time?: string; // e.g., "08:00"
  adhered?: boolean; // whether user completed/adhered to this meal
}

export interface DailyLog {
  week?: number; // associated week (1 to 16)
  day?: number; // associated day (1 to 7)
  date: string; // YYYY-MM-DD
  meals: Meal[];
  waterIntake: number; // in ml
}

export interface CardioType {
  id: string;
  name: string;
  met: number; // Metabolic Equivalent of Task for calorie burn calculation
}

export interface WorkoutEntry {
  id: string;
  week?: number; // associated week (1 to 16)
  date: string; // YYYY-MM-DD
  type: 'strength' | 'cardio' | 'both';
  strengthNotes: string; // e.g. "Peito e Tríceps"
  cardioType: string; // e.g. "Corrida (Moderada)"
  duration: number; // in minutes
  caloriesBurned: number; // calculated
}

export interface MeasurementLog {
  week: number; // 1 to 16
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  waist: number; // cintura in cm
  hip: number; // quadril in cm
  chest: number; // peitoral in cm
  armLeft: number; // braço esquerdo in cm
  armRight: number; // braço direito in cm
  thighLeft: number; // coxa esquerda in cm
  thighRight: number; // coxa direita in cm
  notes?: string;
}

export interface SyncStatus {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
}
