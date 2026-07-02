/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, CardioType, UserProfile, MeasurementLog, DailyLog, WorkoutEntry } from '../types';

export const DEFAULT_FOODS: FoodItem[] = [
  { id: '1', name: 'Peito de Frango Grelhado', calories: 159, protein: 31, carbs: 0, fat: 3.2, unit: 'g', defaultAmount: 100 },
  { id: '2', name: 'Arroz Integral Cozido', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: 'g', defaultAmount: 100 },
  { id: '3', name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: 'g', defaultAmount: 100 },
  { id: '4', name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5, unit: 'g', defaultAmount: 100 },
  { id: '5', name: 'Ovo Inteiro Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: 'unit', defaultAmount: 1 }, // default 1 unit = ~50g (treated as 1 unit in calculations)
  { id: '6', name: 'Ovo Inteiro (Frito/Mexido c/ fio de azeite)', calories: 196, protein: 13, carbs: 1.1, fat: 15, unit: 'unit', defaultAmount: 1 },
  { id: '7', name: 'Clara de Ovo Cozida', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, unit: 'unit', defaultAmount: 1 }, // default 1 unit = ~30g
  { id: '8', name: 'Carne Patinho Moído Grelhado', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, unit: 'g', defaultAmount: 100 },
  { id: '9', name: 'Filé de Tilápia Grelhado', calories: 128, protein: 26, carbs: 0, fat: 2.7, unit: 'g', defaultAmount: 100 },
  { id: '10', name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: 'g', defaultAmount: 100 },
  { id: '11', name: 'Banana Prata', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: 'unit', defaultAmount: 1 }, // ~100g
  { id: '12', name: 'Aveia em Flocos', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, unit: 'g', defaultAmount: 30 },
  { id: '13', name: 'Azeite de Oliva Extra Virgem', calories: 884, protein: 0, carbs: 0, fat: 100, unit: 'g', defaultAmount: 10 }, // 10g ~ 1 colher de sopa
  { id: '14', name: 'Pão Integral de Forma', calories: 110, protein: 4.5, carbs: 20, fat: 1.2, unit: 'unit', defaultAmount: 2 }, // 2 fatias ~ 50g
  { id: '15', name: 'Whey Protein (Concentrado)', calories: 400, protein: 80, carbs: 6.6, fat: 6.6, unit: 'g', defaultAmount: 30 }, // 30g scoop
  { id: '16', name: 'Iogurte Natural Desnatado', calories: 41, protein: 3.8, carbs: 5.8, fat: 0, unit: 'g', defaultAmount: 170 }, // 1 copinho
  { id: '17', name: 'Pasta de Amendoim', calories: 588, protein: 25, carbs: 20, fat: 50, unit: 'g', defaultAmount: 15 }, // 15g ~ 1 colher de sobremesa
  { id: '18', name: 'Queijo Cottage', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, unit: 'g', defaultAmount: 50 },
  { id: '19', name: 'Maçã', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: 'unit', defaultAmount: 1 }, // ~150g
  { id: '20', name: 'Abacate', calories: 160, protein: 2, carbs: 9, fat: 15, unit: 'g', defaultAmount: 100 },
  { id: '21', name: 'Alface Crespa', calories: 15, protein: 1.3, carbs: 2.9, fat: 0.2, unit: 'g', defaultAmount: 50 },
  { id: '22', name: 'Tomate Italiano', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: 'g', defaultAmount: 100 },
  { id: '23', name: 'Castanha do Pará', calories: 656, protein: 14, carbs: 12, fat: 66, unit: 'g', defaultAmount: 10 }, // ~2 unidades
  { id: '24', name: 'Tapioca (Goma seca)', calories: 240, protein: 0, carbs: 60, fat: 0, unit: 'g', defaultAmount: 50 },
];

export const DEFAULT_CARDIOS: CardioType[] = [
  { id: 'c1', name: 'Natação (Intensidade Leve)', met: 6.0 },
  { id: 'c2', name: 'Natação (Intensidade Moderada)', met: 8.0 },
  { id: 'c3', name: 'Natação (Intensidade Vigorosa)', met: 10.0 },
  { id: 'c4', name: 'Ciclismo / Bike (Leve/Lazer <15km/h)', met: 4.0 },
  { id: 'c5', name: 'Ciclismo / Bike (Moderado 15-20km/h)', met: 6.0 },
  { id: 'c6', name: 'Ciclismo / Bike (Vigoroso >20km/h)', met: 8.5 },
  { id: 'c14', name: 'Bike de Spinning (Moderada)', met: 7.0 },
  { id: 'c15', name: 'Bike de Spinning (Intensa)', met: 8.5 },
  { id: 'c7', name: 'Corrida (Trote Leve ~8km/h)', met: 8.0 },
  { id: 'c8', name: 'Corrida (Moderada ~10km/h)', met: 9.8 },
  { id: 'c9', name: 'Corrida (Vigorosa ~12km/h)', met: 12.0 },
  { id: 'c16', name: 'Esteira (Caminhada Inclinada)', met: 5.3 },
  { id: 'c17', name: 'Esteira (Corrida Moderada)', met: 9.0 },
  { id: 'c10', name: 'Caminhada (Moderada)', met: 3.5 },
  { id: 'c11', name: 'Caminhada (Rápida)', met: 4.5 },
  { id: 'c18', name: 'Beach Tênis', met: 7.0 },
  { id: 'c19', name: 'Futebol (Recreativo)', met: 7.0 },
  { id: 'c20', name: 'Futebol (Competitivo)', met: 10.0 },
  { id: 'c21', name: 'Hyrox / Funcional de Alta Intensidade', met: 9.0 },
  { id: 'c22', name: 'Crossfit / HIIT', met: 8.0 },
  { id: 'c23', name: 'Simulador de Escada / Climber', met: 8.0 },
  { id: 'c24', name: 'Elíptico / Transport', met: 5.0 },
  { id: 'c25', name: 'Pular Corda (Moderado)', met: 8.0 },
  { id: 'c26', name: 'Zumba / Aula de Ritmos', met: 6.0 },
  { id: 'c27', name: 'Lutas / Boxe / Muay Thai', met: 7.5 },
  { id: 'c28', name: 'Pilates / Yoga (Ativo)', met: 3.0 },
  { id: 'c29', name: 'Outros (Intensidade Leve)', met: 3.5 },
  { id: 'c30', name: 'Outros (Intensidade Moderada)', met: 5.5 },
  { id: 'c31', name: 'Outros (Intensidade Alta)', met: 8.0 },
  { id: 'c12', name: 'Treino de Musculação (Moderado)', met: 3.5 },
  { id: 'c13', name: 'Treino de Musculação (Intenso)', met: 6.0 },
];

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 30,
  gender: 'female',
  weight: 70.0,
  height: 170,
  activityLevel: 'moderate',
  formula: 'mifflin',
  targetWeight: 65.0,
  weeklyDeficitTarget: 500, // standard 500 kcal deficit
  proteinFactor: 2.0, // 2.0g/kg
  fatFactor: 0.9, // 0.9g/kg
  isManualMacros: false,
  manualCalories: 1600,
  manualProtein: 140,
  manualCarbs: 160,
  manualFat: 45,
  startDate: new Date().toISOString().split('T')[0],
  avatarGender: 'female',
  avatarHairStyle: 'long',
  avatarHairColor: '#1e293b', // black/dark slate
  avatarOutfitStyle: 'athletic',
  avatarOutfitColor: '#4f46e5', // indigo
  avatarSkinColor: '#fbcfe8', // warm peach/pink skin
};

export const INITIAL_MEASUREMENTS = (startDate?: string): MeasurementLog[] => {
  const list: MeasurementLog[] = [];
  const baseDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  
  for (let w = 1; w <= 16; w++) {
    const logDate = new Date(baseDate);
    logDate.setDate(baseDate.getDate() + (w - 1) * 7);
    const dateStr = logDate.toISOString().split('T')[0];
    
    list.push({
      week: w,
      date: dateStr,
      weight: w === 1 ? 70.0 : 0, // start with profile base weight
      waist: 0,
      hip: 0,
      chest: 0,
      armLeft: 0,
      armRight: 0,
      thighLeft: 0,
      thighRight: 0,
      notes: w === 1 ? 'Peso e medidas de ponto de partida.' : '',
    });
  }
  return list;
};

export const INITIAL_DAILY_LOGS = (startDate?: string): DailyLog[] => {
  const today = startDate ? startDate : new Date().toISOString().split('T')[0];
  return [
    {
      date: today,
      waterIntake: 2000,
      meals: [
        {
          id: 'm1',
          name: 'Café da Manhã',
          entries: [],
        },
        {
          id: 'm2',
          name: 'Almoço',
          entries: [],
        },
        {
          id: 'm3',
          name: 'Lanche da Tarde',
          entries: [],
        },
        {
          id: 'm4',
          name: 'Jantar',
          entries: [],
        },
      ],
    },
  ];
};

export const INITIAL_WORKOUTS = (): WorkoutEntry[] => {
  return [];
};

/**
 * Calculates BMR using science-based formulas.
 */
export const calculateBMR = (profile: UserProfile): number => {
  const { weight, height, age, gender, formula } = profile;
  
  if (formula === 'mifflin') {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  } else {
    // Harris-Benedict (Revised 1984)
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  }
};

/**
 * Calculates TDEE (Total Daily Energy Expenditure).
 */
export const calculateTDEE = (profile: UserProfile, bmr: number): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  return bmr * multipliers[profile.activityLevel];
};

/**
 * Calculates target calories and macronutrients.
 */
export const calculateTargetMacros = (profile: UserProfile, targetCalories: number) => {
  if (profile.isManualMacros) {
    return {
      protein: profile.manualProtein ?? 130,
      fat: profile.manualFat ?? 44,
      carbs: profile.manualCarbs ?? 170,
    };
  }

  const { weight, proteinFactor, fatFactor } = profile;
  
  const proteinG = weight * proteinFactor;
  const fatG = weight * fatFactor;
  
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  
  const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsG = remainingKcal / 4;
  
  return {
    protein: proteinG,
    fat: fatG,
    carbs: carbsG,
  };
};
