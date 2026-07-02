/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DailyLog, FoodItem, Meal, MealFoodEntry, UserProfile, WorkoutEntry } from '../types';
import { DEFAULT_FOODS, calculateBMR, calculateTDEE, calculateTargetMacros } from '../data/defaults';
import { Plus, Trash2, Search, Utensils, Droplet, Sparkles, Scale, Percent, Check, Flame, TrendingDown, TrendingUp, Info, Activity, Dumbbell, Zap } from 'lucide-react';

const formatDateBR = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  } catch (e) {
    return dateStr;
  }
};

const getDayOfWeekName = (dateStr: string) => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
  } catch (e) {
    return '';
  }
};

interface FoodItemRowProps {
  food: FoodItem;
  onAddFood: (food: FoodItem, amount: number) => void;
}

const FoodItemRow: React.FC<FoodItemRowProps> = ({ food, onAddFood }) => {
  const [amount, setAmount] = useState<number>(food.defaultAmount);
  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 hover:border-slate-300 transition-all flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-slate-700">{food.name}</span>
        <span className="text-[10px] text-slate-400 font-mono font-semibold">
          {food.calories} kcal / 100{food.unit === 'g' ? 'g' : 'un'}
        </span>
      </div>
      <div className="text-[10px] text-slate-500 flex gap-2">
        <span>P: {food.protein}g</span>
        <span>C: {food.carbs}g</span>
        <span>G: {food.fat}g</span>
      </div>
      
      {/* Input quantity and add */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center flex-1">
          <input
            type="number"
            min="1"
            className="w-full text-xs text-center bg-white border border-slate-200 rounded-lg py-1 text-slate-700 focus:outline-hidden font-mono font-semibold"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
          />
          <span className="text-[10px] text-slate-400 ml-1.5 font-bold uppercase">{food.unit}</span>
        </div>
        <button
          id={`add-food-btn-${food.id}`}
          onClick={() => onAddFood(food, amount)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg p-1.5 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
          title="Adicionar"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

interface MealPlannerProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onDailyLogChange: (newLog: DailyLog) => void;
  selectedDay: number;
  onDayChange: (day: number) => void;
  activeWeekLogs: DailyLog[];
  workouts?: WorkoutEntry[];
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  profile,
  dailyLog,
  onDailyLogChange,
  selectedDay,
  onDayChange,
  activeWeekLogs,
  workouts = [],
}) => {
  const sortedWeekLogs = useMemo(() => {
    return [...activeWeekLogs].sort((a, b) => (a.day || 1) - (b.day || 1));
  }, [activeWeekLogs]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealId, setSelectedMealId] = useState<string>('m1');
  
  // Custom manual food form states (using strings to allow smooth typing & decimals without reset)
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('100');
  const [customProtein, setCustomProtein] = useState('5.0');
  const [customCarbs, setCustomCarbs] = useState('15.0');
  const [customFat, setCustomFat] = useState('2.0');
  const [customUnit, setCustomUnit] = useState<'g' | 'unit'>('g');
  const [customAmount, setCustomAmount] = useState('100');
  
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Filter food items based on search
  const filteredFoods = useMemo(() => {
    if (!searchTerm) return DEFAULT_FOODS.slice(0, 6);
    return DEFAULT_FOODS.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Target values derived from calculations
  const targetCalories = useMemo(() => {
    if (profile.isManualMacros && profile.manualCalories) {
      return profile.manualCalories;
    }
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile, bmr);
    return Math.max(1200, tdee - profile.weeklyDeficitTarget);
  }, [profile]);

  const targetMacros = useMemo(() => {
    return calculateTargetMacros(profile, targetCalories);
  }, [profile, targetCalories]);

  // Compute actual daily totals
  const actualTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    dailyLog.meals.forEach((meal) => {
      meal.entries.forEach((entry) => {
        calories += entry.calories;
        protein += entry.protein;
        carbs += entry.carbs;
        fat += entry.fat;
      });
    });

    return { calories, protein, carbs, fat };
  }, [dailyLog]);

  // Adherence calculations
  const totalMealsCount = dailyLog.meals.length;
  const adheredMealsCount = dailyLog.meals.filter(m => m.adhered).length;
  const adherenceRatePercent = totalMealsCount > 0 ? (adheredMealsCount / totalMealsCount) * 100 : 0;

  // --- New physiological calorie comparison calculations ---
  const bmrValue = useMemo(() => {
    return calculateBMR(profile);
  }, [profile]);

  const tdeeBaselineValue = useMemo(() => {
    return calculateTDEE(profile, bmrValue);
  }, [profile, bmrValue]);

  const routineActivityValue = useMemo(() => {
    return Math.max(0, tdeeBaselineValue - bmrValue);
  }, [tdeeBaselineValue, bmrValue]);

  const dailyWorkouts = useMemo(() => {
    if (!workouts || !dailyLog.date) return [];
    return workouts.filter((w) => w.date === dailyLog.date);
  }, [workouts, dailyLog.date]);

  const dailyWorkoutCalories = useMemo(() => {
    return dailyWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  }, [dailyWorkouts]);

  const totalExpenditureValue = useMemo(() => {
    return tdeeBaselineValue + dailyWorkoutCalories;
  }, [tdeeBaselineValue, dailyWorkoutCalories]);

  const realCaloricDiff = useMemo(() => {
    return actualTotals.calories - totalExpenditureValue;
  }, [actualTotals.calories, totalExpenditureValue]);

  // Handle updating meal (like time or adherence)
  const handleUpdateMeal = (mealId: string, updates: Partial<Meal>) => {
    const updatedMeals = dailyLog.meals.map((m) => {
      if (m.id === mealId) {
        return { ...m, ...updates };
      }
      return m;
    });
    onDailyLogChange({
      ...dailyLog,
      meals: updatedMeals,
    });
  };

  // Handle adding food item
  const handleAddFood = (food: FoodItem, amount: number) => {
    const factor = food.unit === 'g' ? amount / 100 : amount;
    
    const entry: MealFoodEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      foodId: food.id,
      name: food.name,
      amount: amount,
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fat: Math.round(food.fat * factor * 10) / 10,
    };

    const updatedMeals = dailyLog.meals.map((meal) => {
      if (meal.id === selectedMealId) {
        return {
          ...meal,
          entries: [...meal.entries, entry],
        };
      }
      return meal;
    });

    onDailyLogChange({
      ...dailyLog,
      meals: updatedMeals,
    });
    setSearchTerm('');
  };

  // Handle adding custom food
  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const parsedCalories = parseInt(customCalories) || 0;
    const parsedProtein = parseFloat(customProtein) || 0;
    const parsedCarbs = parseFloat(customCarbs) || 0;
    const parsedFat = parseFloat(customFat) || 0;
    const parsedAmount = parseFloat(customAmount) || 100;

    const dummyItem: FoodItem = {
      id: `custom_${Date.now()}`,
      name: customName,
      calories: parsedCalories,
      protein: parsedProtein,
      carbs: parsedCarbs,
      fat: parsedFat,
      unit: customUnit,
      defaultAmount: 100,
    };

    handleAddFood(dummyItem, parsedAmount);
    
    // Reset manual form fields
    setCustomName('');
    setCustomCalories('100');
    setCustomProtein('5.0');
    setCustomCarbs('15.0');
    setCustomFat('2.0');
    setCustomAmount('100');
    setShowCustomForm(false);
  };

  // Handle removing entry
  const handleRemoveEntry = (mealId: string, entryId: string) => {
    const updatedMeals = dailyLog.meals.map((meal) => {
      if (meal.id === mealId) {
        return {
          ...meal,
          entries: meal.entries.filter((entry) => entry.id !== entryId),
        };
      }
      return meal;
    });

    onDailyLogChange({
      ...dailyLog,
      meals: updatedMeals,
    });
  };

  // Update water intake
  const handleWaterChange = (amount: number) => {
    onDailyLogChange({
      ...dailyLog,
      waterIntake: Math.max(0, dailyLog.waterIntake + amount),
    });
  };

  // Safe checks for deficit visualization
  const calorieDiff = actualTotals.calories - targetCalories;
  const isDeficit = calorieDiff <= 0;

  return (
    <div id="meal-planner-root" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Days of the Week Selection Bar */}
      <div id="days-selector-bar" className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
              Semana {dailyLog.week || 1}
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              Planejamento Diário (7 Dias)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">
            Navegue pelos dias da semana para registrar sua alimentação.
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {sortedWeekLogs.map((log) => {
            const d = log.day || 1;
            const isSelected = selectedDay === d;
            
            // Calculate actual calories logged for this day
            let loggedCals = 0;
            log.meals.forEach((meal) => {
              meal.entries.forEach((entry) => {
                loggedCals += entry.calories;
              });
            });
            
            return (
              <button
                key={d}
                id={`day-select-btn-${d}`}
                onClick={() => onDayChange(d)}
                className={`flex-1 min-w-[110px] text-center p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  Dia {d}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {log.date ? formatDateBR(log.date) : ''}
                </div>
                <div className={`text-[9px] mt-1 font-mono font-bold ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {loggedCals > 0 ? `${Math.round(loggedCals)} kcal` : 'Vazio'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Col 1 & 2: Meal Diary */}
      <div id="diary-container" className="xl:col-span-2 flex flex-col gap-6">
        {/* Daily Macros Progress bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
              <span>Dia {dailyLog.day || selectedDay}</span>
              {dailyLog.date && (
                <span className="text-xs text-slate-400 font-semibold">
                  ({formatDateBR(dailyLog.date)} - {getDayOfWeekName(dailyLog.date)})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isDeficit ? 'bg-slate-100 text-slate-800' : 'bg-red-50 text-red-700'}`}>
                {isDeficit 
                  ? `Déficit Ativo (${Math.round(Math.abs(calorieDiff))} kcal restantes)` 
                  : `Superávit (+${Math.round(calorieDiff)} kcal)`
                }
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Calorias</span>
              <div className="text-lg font-bold text-slate-800 mt-1">{Math.round(actualTotals.calories)}</div>
              <span className="text-[9px] text-slate-400">Meta: {Math.round(targetCalories)} kcal</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Proteínas</span>
              <div className="text-lg font-bold text-slate-800 mt-1">{Math.round(actualTotals.protein)}g</div>
              <span className="text-[9px] text-slate-400">Meta: {Math.round(targetMacros.protein)}g</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Carbos</span>
              <div className="text-lg font-bold text-slate-800 mt-1">{Math.round(actualTotals.carbs)}g</div>
              <span className="text-[9px] text-slate-400">Meta: {Math.round(targetMacros.carbs)}g</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gorduras</span>
              <div className="text-lg font-bold text-slate-800 mt-1">{Math.round(actualTotals.fat)}g</div>
              <span className="text-[9px] text-slate-400">Meta: {Math.round(targetMacros.fat)}g</span>
            </div>
          </div>

          {/* Calorie Balance indicator */}
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Energia Diária Consumida</span>
              <span>{Math.round((actualTotals.calories / targetCalories) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300 bg-slate-800"
                style={{ width: `${Math.min(100, (actualTotals.calories / targetCalories) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Módulo de Balanço Calórico Fisiológico Real */}
        <div id="physiological-calorie-balance-module" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Balanço Energético Fisiológico</h3>
                <p className="text-[10px] text-slate-400 font-medium">Consumo Alimentar vs Gasto Real (TMB + Atividades)</p>
              </div>
            </div>
            
            {/* Net balance badge */}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-center ${
              realCaloricDiff <= 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                : 'bg-amber-50 text-amber-700 border border-amber-200/50'
            }`}>
              {realCaloricDiff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(Math.round(realCaloricDiff))} kcal {realCaloricDiff <= 0 ? 'Déficit Real' : 'Superávit Real'}
            </span>
          </div>

          {/* Graphical comparison bar */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex flex-col sm:flex-row sm:justify-between text-xs font-semibold text-slate-600 gap-1">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block"></span>
                Consumo: <strong>{Math.round(actualTotals.calories)} kcal</strong>
              </span>
              <span className="flex items-center sm:justify-end gap-1.5 text-slate-700">
                Gasto Real Total: <strong>{Math.round(totalExpenditureValue)} kcal</strong>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              </span>
            </div>
            
            {/* Double Segmented Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/40">
              {actualTotals.calories > 0 && (
                <div 
                  className="h-full rounded-l-full bg-slate-800 transition-all duration-300"
                  style={{ 
                    width: `${(actualTotals.calories / (actualTotals.calories + totalExpenditureValue)) * 100}%` 
                  }}
                  title={`Consumo: ${Math.round(actualTotals.calories)} kcal`}
                />
              )}
              <div 
                className={`h-full rounded-r-full bg-indigo-600 transition-all duration-300 ${actualTotals.calories === 0 ? 'rounded-l-full' : ''}`}
                style={{ 
                  width: `${(totalExpenditureValue / (actualTotals.calories + totalExpenditureValue)) * 100}%` 
                }}
                title={`Gasto: ${Math.round(totalExpenditureValue)} kcal`}
              />
            </div>
          </div>

          {/* Expenditure Breakdown Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {/* Card 1: BMR / TMB */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TMB (Basal)</span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded">Involuntário</span>
              </div>
              <div className="text-sm font-extrabold text-slate-700 font-mono">
                {Math.round(bmrValue)} <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal mt-1">
                Gasto básico para manter funções vitais em repouso absoluto.
              </p>
            </div>

            {/* Card 2: Lifestyle / Baseline Activities */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Atividades da Rotina</span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded">NEAT</span>
              </div>
              <div className="text-sm font-extrabold text-slate-700 font-mono">
                {Math.round(routineActivityValue)} <span className="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal mt-1">
                Fator de atividade de rotina ({
                  profile.activityLevel === 'sedentary' ? 'Sedentário' :
                  profile.activityLevel === 'light' ? 'Leve' :
                  profile.activityLevel === 'moderate' ? 'Moderado' :
                  profile.activityLevel === 'active' ? 'Ativo' : 'Extremo'
                }).
              </p>
            </div>

            {/* Card 3: Additional Workouts */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Treinos do Dia</span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded">Exercícios</span>
              </div>
              <div className="text-sm font-extrabold text-slate-700 font-mono flex items-center gap-1.5">
                {dailyWorkoutCalories > 0 ? (
                  <>
                    <span className="text-indigo-600 font-black">+{Math.round(dailyWorkoutCalories)}</span>
                    <span className="text-[10px] font-bold text-slate-400">kcal</span>
                  </>
                ) : (
                  <span className="text-slate-400 font-bold">0 kcal</span>
                )}
              </div>
              {dailyWorkouts.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {dailyWorkouts.map((w, index) => (
                    <span key={index} className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-medium truncate max-w-full">
                      {w.type === 'strength' ? 'Musculação' : w.type === 'cardio' ? w.cardioType || 'Cardio' : 'Misto'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-slate-400 leading-normal mt-1">
                  Nenhuma atividade registrada hoje.
                </p>
              )}
            </div>
          </div>

          {/* Dynamic Scientific Insights / Explanation */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-700">Insight Científico:</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {realCaloricDiff <= 0 ? (
                  <>
                    Você está em um <strong>déficit calórico fisiológico de {Math.round(Math.abs(realCaloricDiff))} kcal</strong> hoje. 
                    Seu organismo está ativamente mobilizando gordura armazenada para cobrir essa lacuna energética diária.
                  </>
                ) : (
                  <>
                    Você está em um <strong>superávit calórico de {Math.round(realCaloricDiff)} kcal</strong> hoje. 
                    Esse excedente energético é utilizado pelo corpo para recuperação de glicogênio muscular, síntese de proteínas ou armazenado.
                  </>
                )}
              </p>
              {dailyWorkouts.length === 0 && (
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  Dica: Para ampliar o déficit fisiológico saudável e preservar massa magra, registre suas atividades na aba de <strong>Treinos & Cardio</strong>.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Adherence Rate Tracker Bar */}
        <div className="bg-white border border-slate-250/60 rounded-xl p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${adheredMealsCount === totalMealsCount && totalMealsCount > 0 ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Adesão ao Plano de Hoje</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {adheredMealsCount} de {totalMealsCount} refeições concluídas ({Math.round(adherenceRatePercent)}% de consistência hoje)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="adhere-all-meals-btn"
              onClick={() => {
                const allAdhered = dailyLog.meals.map(m => ({ ...m, adhered: true }));
                onDailyLogChange({ ...dailyLog, meals: allAdhered });
              }}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-3xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-3 h-3 stroke-[3px]" /> Aderir ao Plano Todo
            </button>
            
            <button
              id="reset-adherence-btn"
              onClick={() => {
                const noneAdhered = dailyLog.meals.map(m => ({ ...m, adhered: false }));
                onDailyLogChange({ ...dailyLog, meals: noneAdhered });
              }}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Meals breakdown list */}
        <div className="flex flex-col gap-4">
          {dailyLog.meals.map((meal) => {
            const mealCals = meal.entries.reduce((sum, e) => sum + e.calories, 0);
            const mealProt = meal.entries.reduce((sum, e) => sum + e.protein, 0);
            const mealCarbs = meal.entries.reduce((sum, e) => sum + e.carbs, 0);
            const mealFat = meal.entries.reduce((sum, e) => sum + e.fat, 0);
            const isSelectedMeal = selectedMealId === meal.id;

            return (
              <div 
                key={meal.id} 
                className={`bg-white border rounded-xl p-4 transition-all ${
                  meal.adhered 
                    ? 'border-emerald-300 bg-emerald-50/10 shadow-3xs' 
                    : isSelectedMeal 
                      ? 'border-slate-800 ring-1 ring-slate-800/10 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMealId(meal.id)}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    {/* Checkbox for meal adherence */}
                    <button
                      id={`toggle-adhered-${meal.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateMeal(meal.id, { adhered: !meal.adhered });
                      }}
                      className={`p-1 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        meal.adhered
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                      }`}
                      title={meal.adhered ? "Refeição consumida! Clique para desmarcar" : "Marcar refeição como concluída/consumida"}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                    </button>

                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold transition-all ${meal.adhered ? 'text-emerald-800 line-through opacity-70' : 'text-slate-800'}`}>
                        {meal.name}
                      </span>
                      {/* Meal Time Selector */}
                      <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Horário:</span>
                        <input
                          type="time"
                          className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.2 cursor-pointer focus:outline-hidden focus:border-slate-400"
                          value={meal.time || ''}
                          onChange={(e) => {
                            handleUpdateMeal(meal.id, { time: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-medium">
                      P: {Math.round(mealProt)}g | C: {Math.round(mealCarbs)}g | G: {Math.round(mealFat)}g
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm transition-colors ${meal.adhered ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {Math.round(mealCals)} kcal
                    </span>
                  </div>
                </div>

                {/* Meal entries */}
                {meal.entries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nenhum alimento cadastrado nesta refeição.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {meal.entries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-1 rounded-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{entry.name}</span>
                          <span className="text-[10px] text-slate-400">Qtd: {entry.amount}{entry.foodId.startsWith('custom') ? '' : 'g'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-[10px] text-slate-400 font-mono">
                            <span>{Math.round(entry.protein)}g P | {Math.round(entry.carbs)}g C | {Math.round(entry.fat)}g G</span>
                          </div>
                          <span className="font-semibold text-slate-600 font-mono w-14 text-right">{entry.calories} kcal</span>
                          <button 
                            id={`remove-entry-${entry.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEntry(meal.id, entry.id);
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Water Intake Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Droplet className="w-5 h-5 fill-slate-500 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Hidratação Recomendada</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Registre seu consumo de água para acompanhar o plano.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-slate-800 font-mono">{dailyLog.waterIntake} ml</span>
            <div className="flex gap-1.5">
              <button 
                id="water-dec-250"
                onClick={() => handleWaterChange(-250)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                -250ml
              </button>
              <button 
                id="water-add-250"
                onClick={() => handleWaterChange(250)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                +250ml
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Search / Add Food tool */}
      <div id="add-food-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-slate-700" />
            Adicionar Alimento
          </h2>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-sm">
            {dailyLog.meals.find(m => m.id === selectedMealId)?.name}
          </span>
        </div>

        {/* Toggle Custom form */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            id="toggle-search-food-tab"
            onClick={() => setShowCustomForm(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md text-center transition-all cursor-pointer ${!showCustomForm ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tabela
          </button>
          <button
            id="toggle-custom-food-tab"
            onClick={() => setShowCustomForm(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md text-center transition-all cursor-pointer ${showCustomForm ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Manual
          </button>
        </div>

        {!showCustomForm ? (
          /* Search & database option */
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                placeholder="Pesquisar peito de frango, ovo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Results */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {filteredFoods.map((food) => (
                <FoodItemRow key={food.id} food={food} onAddFood={handleAddFood} />
              ))}
            </div>
          </div>
        ) : (
          /* Custom food form */
          <form onSubmit={handleAddCustomFood} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Nome do Alimento</label>
              <input
                type="text"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400"
                placeholder="Ex: Iogurte Grego Natural"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Calorias {customUnit === 'g' ? '(por 100g)' : '(por un)'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-slate-400 font-mono font-medium"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Qtd para Inserir</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden font-bold font-mono"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 cursor-pointer font-bold"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as 'g' | 'unit')}
                  >
                    <option value="g">g</option>
                    <option value="unit">un</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic scientific guidance helper */}
            <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg leading-relaxed border border-slate-100">
              {customUnit === 'g' ? (
                <span>💡 Insira os valores nutricionais <strong>referentes a 100g</strong>. O app vai calcular automaticamente a proporção exata para a quantidade desejada.</span>
              ) : (
                <span>💡 Insira os valores nutricionais <strong>por 1 unidade</strong>. O app vai multiplicar pela quantidade de unidades desejada.</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Prot {customUnit === 'g' ? '(g/100g)' : '(g/un)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-850 font-bold font-mono focus:outline-hidden"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Carb {customUnit === 'g' ? '(g/100g)' : '(g/un)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-850 font-bold font-mono focus:outline-hidden"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Gord {customUnit === 'g' ? '(g/100g)' : '(g/un)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-850 font-bold font-mono focus:outline-hidden"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                />
              </div>
            </div>

            <button
              id="submit-custom-food-button"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Alimento Manual
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
