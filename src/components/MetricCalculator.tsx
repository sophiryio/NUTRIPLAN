/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { UserProfile, MeasurementLog } from '../types';
import { calculateBMR, calculateTDEE, calculateTargetMacros } from '../data/defaults';
import { HealthQuestionnaire } from './HealthQuestionnaire';
import { HealthNutritionalGuide } from './HealthNutritionalGuide';
import { Info, Award, Settings, User as UserIcon, Flame, Heart, ChevronRight, Scale, Calendar, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface MetricCalculatorProps {
  profile: UserProfile;
  onProfileChange: (newProfile: UserProfile) => void;
  selectedWeekFilter: number | 'all';
  measurements: MeasurementLog[];
  onMeasurementsChange: (newMeasurements: MeasurementLog[]) => void;
  onStartDateChange?: (newStartDate: string) => void;
}

export const MetricCalculator: React.FC<MetricCalculatorProps> = ({
  profile,
  onProfileChange,
  selectedWeekFilter,
  measurements,
  onMeasurementsChange,
  onStartDateChange,
}) => {
  const [showHealthForm, setShowHealthForm] = useState(false);
  // Find weight for the selected week
  const selectedWeekWeight = useMemo(() => {
    if (selectedWeekFilter === 'all') {
      return null;
    }
    const weekData = measurements.find((m) => m.week === selectedWeekFilter);
    return weekData && weekData.weight && weekData.weight > 0 ? weekData.weight : null;
  }, [measurements, selectedWeekFilter]);

  const currentWeightForCalculation = useMemo(() => {
    if (selectedWeekFilter === 'all' || !selectedWeekWeight) {
      // Find the latest recorded weight across all filled weeks, or fall back to profile.weight
      const filledMeasurements = measurements.filter((m) => m.weight && m.weight > 0);
      if (filledMeasurements.length > 0) {
        return filledMeasurements[filledMeasurements.length - 1].weight;
      }
      return profile.weight;
    }
    return selectedWeekWeight;
  }, [selectedWeekFilter, selectedWeekWeight, profile.weight, measurements]);

  const profileForCalculation = useMemo(() => {
    return {
      ...profile,
      weight: currentWeightForCalculation,
    };
  }, [profile, currentWeightForCalculation]);

  const bmr = useMemo(() => calculateBMR(profileForCalculation), [profileForCalculation]);
  const tdee = useMemo(() => calculateTDEE(profileForCalculation, bmr), [profileForCalculation]);
  
  // Daily target calories based on deficit or manual override
  const targetCalories = useMemo(() => {
    if (profile.isManualMacros) {
      return profile.manualCalories ?? 1600;
    }
    return Math.max(1200, tdee - profile.weeklyDeficitTarget); // Ensure safe minimum of 1200 kcal
  }, [tdee, profile.weeklyDeficitTarget, profile.isManualMacros, profile.manualCalories]);

  const macros = useMemo(() => calculateTargetMacros(profileForCalculation, targetCalories), [profileForCalculation, targetCalories]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    onProfileChange({
      ...profile,
      [field]: value,
    });
  };

  // Weekly estimated loss calculation
  // 500 kcal daily deficit = ~3500 kcal weekly deficit = ~0.45kg loss per week
  const estWeeklyLoss = profile.weeklyDeficitTarget / 1100; // rough estimation (1kg of fat ≈ 7700 kcal, so 500 kcal is ~0.45kg/week or 1lb/week)
  return (
    <div id="metric-calculator-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Config Form */}
      <div id="calculator-form-container" className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Settings className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-800">Parâmetros de Biometria</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* Week weight focus card when filtered */}
          {selectedWeekFilter !== 'all' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-500" />
                  Peso da Semana {selectedWeekFilter}
                </span>
                <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm">Filtro Ativo</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Insira o peso desta semana para atualizar os macros e taxas de forma personalizada.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Defina o peso em kg"
                  className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold font-mono w-full text-slate-800 focus:outline-hidden focus:border-slate-400"
                  value={selectedWeekWeight || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const updated = measurements.map((m) => {
                      if (m.week === selectedWeekFilter) {
                        return { ...m, weight: val, date: m.date || new Date().toISOString().split('T')[0] };
                      }
                      return m;
                    });
                    onMeasurementsChange(updated);
                  }}
                />
                <span className="text-xs font-bold text-slate-500">kg</span>
              </div>
              {!selectedWeekWeight && (
                <span className="text-[9px] text-slate-400 font-medium italic mt-0.5">
                  Nenhum peso registrado. Usando peso inicial de {profile.weight} kg.
                </span>
              )}
            </div>
          )}

          {/* Nome e Foto */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Seu Nome</label>
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400 font-semibold"
                value={profile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Foto de Perfil</label>
              <div className="flex items-center gap-3">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-300">
                    S/F
                  </div>
                )}
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex gap-2">
                    <label className="flex-1 py-1 px-2.5 text-center text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-nowrap">
                      Upload Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleInputChange('photoUrl', reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {profile.photoUrl && (
                      <button
                        type="button"
                        onClick={() => handleInputChange('photoUrl', '')}
                        className="py-1 px-2.5 text-xs font-bold bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Ou cole uma URL de imagem..."
                    className="w-full text-[10px] bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-hidden focus:border-slate-400"
                    value={profile.photoUrl && !profile.photoUrl.startsWith('data:') ? profile.photoUrl : ''}
                    onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data de Início da Dieta */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Data de Início da Dieta
            </label>
            <input
              type="date"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:border-slate-400 cursor-pointer"
              value={profile.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                if (onStartDateChange) {
                  onStartDateChange(e.target.value);
                } else {
                  handleInputChange('startDate', e.target.value);
                }
              }}
            />
          </div>

          {/* Idade e Gênero */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Idade (anos)</label>
              <input
                type="number"
                min="1"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                value={profile.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Gênero</label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
              </select>
            </div>
          </div>

          {/* Peso e Altura */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                value={profile.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Altura (cm)</label>
              <input
                type="number"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                value={profile.height}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Peso Alvo */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Meta (kg em 16 sem.)</label>
            <input
              type="number"
              step="0.1"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
              value={profile.targetWeight}
              onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Nível de Atividade */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nível de Atividade Diária</label>
            <select
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
              value={profile.activityLevel}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
            >
              <option value="sedentary">Sedentário (Trabalho sentado, sem treino)</option>
              <option value="light">Atividade Leve (Treino leve 1-3 dias/sem)</option>
              <option value="moderate">Atividade Moderada (Treino moderado 3-5 dias/sem)</option>
              <option value="active">Atividade Intensa (Treino diário pesado)</option>
              <option value="extreme">Extremamente Ativo (Atleta ou trabalho físico)</option>
            </select>
          </div>

          {/* Fórmula e Déficit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Fórmula Científica</label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400 font-medium"
                value={profile.formula}
                onChange={(e) => handleInputChange('formula', e.target.value)}
              >
                <option value="mifflin">Mifflin-St Jeor</option>
                <option value="harris">Harris-Benedict</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Déficit Alvo</label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400 font-semibold text-slate-800"
                value={profile.weeklyDeficitTarget}
                disabled={profile.isManualMacros}
                onChange={(e) => handleInputChange('weeklyDeficitTarget', parseInt(e.target.value) || 0)}
              >
                <option value="300">Suave (-300 kcal)</option>
                <option value="500">Moderado (-500 kcal)</option>
                <option value="750">Intenso (-750 kcal)</option>
                <option value="1000">Agressivo (-1000 kcal)</option>
              </select>
            </div>
          </div>

          {/* Método dos Macronutrientes */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 mb-2">Método de Metas & Macros</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleInputChange('isManualMacros', false)}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  !profile.isManualMacros
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Automático
              </button>
              <button
                type="button"
                onClick={() => {
                  onProfileChange({
                    ...profile,
                    isManualMacros: true,
                    manualCalories: profile.manualCalories ?? Math.round(targetCalories),
                    manualProtein: profile.manualProtein ?? Math.round(macros.protein),
                    manualCarbs: profile.manualCarbs ?? Math.round(macros.carbs),
                    manualFat: profile.manualFat ?? Math.round(macros.fat),
                  });
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  profile.isManualMacros
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Manual (Custom)
              </button>
            </div>
          </div>

          {/* Proteínas e Gorduras fatores ou Macros Manuais */}
          {!profile.isManualMacros ? (
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                Parâmetros Nutricionais (g/kg)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Proteínas (g/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.2"
                    max="3.0"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
                    value={profile.proteinFactor}
                    onChange={(e) => handleInputChange('proteinFactor', parseFloat(e.target.value) || 2.0)}
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Sugerido: 2.0</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Gorduras (g/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="1.5"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
                    value={profile.fatFactor}
                    onChange={(e) => handleInputChange('fatFactor', parseFloat(e.target.value) || 0.9)}
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block font-medium">Sugerido: 0.9</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                Definição Manual
              </span>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Calorias Diárias (kcal)</label>
                <input
                  type="number"
                  min="500"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-bold focus:outline-hidden"
                  value={profile.manualCalories ?? 1600}
                  onChange={(e) => handleInputChange('manualCalories', parseInt(e.target.value) || 1600)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-1">Proteínas (g)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-bold focus:outline-hidden"
                    value={profile.manualProtein ?? 130}
                    onChange={(e) => handleInputChange('manualProtein', parseInt(e.target.value) || 130)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-bold focus:outline-hidden"
                    value={profile.manualCarbs ?? 170}
                    onChange={(e) => handleInputChange('manualCarbs', parseInt(e.target.value) || 170)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 mb-1">Gorduras (g)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 font-bold focus:outline-hidden"
                    value={profile.manualFat ?? 44}
                    onChange={(e) => handleInputChange('manualFat', parseInt(e.target.value) || 44)}
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-100">
                Soma: {Math.round(((profile.manualProtein ?? 130) * 4) + ((profile.manualCarbs ?? 170) * 4) + ((profile.manualFat ?? 44) * 9))} kcal
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Col 2 & 3: Metric Results & Study Context */}
      <div id="calculator-results-container" className="lg:col-span-2 flex flex-col gap-6">
        {/* Metabolic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card BMR */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Metabolismo Basal (TMB)</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">{Math.round(bmr)}</span>
              <span className="text-xs font-semibold text-slate-400">kcal</span>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-normal">
              Necessidade energética celular em repouso absoluto.
            </p>
          </div>

          {/* Card TDEE */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-sans">Gasto Diário Total (TDEE)</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">{Math.round(tdee)}</span>
              <span className="text-xs font-semibold text-slate-400">kcal</span>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-normal">
              TMB somada ao fator de atividade selecionado.
            </p>
          </div>

          {/* Card Target Calories */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Ingestão Recomendada</span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800 font-mono">{Math.round(targetCalories)}</span>
              <span className="text-xs font-semibold text-slate-400">kcal</span>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-normal">
              Calorias diárias recomendadas para o déficit estabelecido.
            </p>
          </div>
        </div>

        {/* Macros Breakdown Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span>Metas de Macronutrientes</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protein */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-700">Proteínas</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{Math.round(macros.protein)}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-800 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(macros.protein * 4 / targetCalories) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Aproximadamente {Math.round(macros.protein * 4)} kcal • {profile.proteinFactor}g por kg.
              </p>
            </div>

            {/* Carbs */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-700">Carboidratos</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{Math.round(macros.carbs)}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(macros.carbs * 4 / targetCalories) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Aproximadamente {Math.round(macros.carbs * 4)} kcal • Fonte principal de energia.
              </p>
            </div>

            {/* Fat */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-700">Gorduras</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{Math.round(macros.fat)}g</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(macros.fat * 9 / targetCalories) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Aproximadamente {Math.round(macros.fat * 9)} kcal • {profile.fatFactor}g por kg.
              </p>
            </div>
          </div>
        </div>

        {/* Avaliação de Saúde e Condições Clínicas Expandable Card */}
        <div id="health-conditions-section" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Avaliação de Saúde & Condições Clínicas</h3>
                <p className="text-xs text-slate-500">Ajuste seu plano de acordo com diagnósticos de diabetes, hipertensão, SOP, tireoide, etc.</p>
              </div>
            </div>

            <button
              id="toggle-health-form-btn"
              onClick={() => setShowHealthForm((prev) => !prev)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {showHealthForm ? 'Ocultar Questionário' : 'Preencher / Editar Saúde'}
              {showHealthForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showHealthForm ? (
            <div className="mt-2">
              <HealthQuestionnaire
                profile={profile}
                onProfileChange={onProfileChange}
                onClose={() => setShowHealthForm(false)}
              />
            </div>
          ) : (
            <div className="mt-1">
              <HealthNutritionalGuide
                profile={profile}
                onOpenQuestionnaire={() => setShowHealthForm(true)}
              />
            </div>
          )}
        </div>

        {/* Decorative Minimalist Illustration Card */}
        <div className="bg-slate-900 text-white border border-slate-950 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-sm">
            <h4 className="text-sm font-bold text-slate-150 flex items-center gap-1.5">
              <span>Seu Planejamento de Saúde</span>
            </h4>
            <p className="text-xs text-slate-400 leading-normal">
              Seu metabolismo se adapta a cada quilo perdido. Nosso cronograma científico recalcula as necessidades calóricas semanais automaticamente para evitar o platô biológico.
            </p>
          </div>

          {/* Inline SVG Minimalist Wellness Vector */}
          <div className="w-28 h-20 shrink-0 select-none opacity-90">
            <svg viewBox="0 0 100 80" className="w-full h-full">
              {/* Abstract wellness geometry representing progress, water/balance */}
              <circle cx="50" cy="40" r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 20 50 Q 50 15 80 50" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 20 60 Q 50 25 80 60" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="50" cy="32" r="5" fill="#10b981" />
              <circle cx="35" cy="42" r="3" fill="#6366f1" />
              <circle cx="65" cy="42" r="3" fill="#ec4899" />
              <line x1="50" y1="32" x2="50" y2="65" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* Science Info & Study Reference */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Referência Científica das Fórmulas
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            Os cálculos baseiam-se nos estudos de <strong>Mifflin-St Jeor (1990)</strong> e <strong>Harris-Benedict (Revisado em 1984)</strong>, amplamente validados pela literatura médica e diretrizes de nutrição clínica contemporâneas.
          </p>
          <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-600 font-medium leading-normal">
            Expectativa média de perda de <span className="text-slate-900 font-bold">{estWeeklyLoss.toFixed(2)} kg por semana</span>, totalizando cerca de <span className="text-slate-900 font-bold">{(estWeeklyLoss * 16).toFixed(1)} kg em 16 semanas</span> saudáveis.
          </div>
        </div>
      </div>
    </div>
  );
};
