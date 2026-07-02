import React, { useMemo } from 'react';
import { UserProfile, MeasurementLog } from '../types';
import { User as UserIcon, Award, Target, Scale } from 'lucide-react';

interface InteractiveAvatarProps {
  profile: UserProfile;
  onProfileChange?: (profile: UserProfile) => void;
  measurements: MeasurementLog[];
  compact?: boolean;
}

export const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({
  profile,
  measurements,
  compact = false,
}) => {
  // Determine current active weight from logged measurements (last logged, fallback to current profile weight)
  const currentWeight = useMemo(() => {
    if (!measurements || !Array.isArray(measurements)) {
      return profile?.weight || 75;
    }
    const sortedWithWeight = [...measurements]
      .filter((m) => m && m.weight && m.weight > 0)
      .sort((a, b) => b.week - a.week);
    if (sortedWithWeight.length > 0 && sortedWithWeight[0].weight) {
      return sortedWithWeight[0].weight;
    }
    return profile?.weight || 75;
  }, [measurements, profile?.weight]);

  const targetWeight = profile?.targetWeight || 63;
  
  const ratio = useMemo(() => {
    if (!targetWeight || !currentWeight) return 1.1;
    return currentWeight / targetWeight;
  }, [currentWeight, targetWeight]);

  const fitnessLabel = useMemo(() => {
    if (ratio <= 1.0) return 'Meta Atingida! Fit & Saudável ✨';
    if (ratio < 1.05) return 'Fase de Definição Ativa 💪';
    if (ratio < 1.15) return 'Foco & Consistência 🏃';
    return 'Ponto de Partida Desafiador 🔥';
  }, [ratio]);

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Static elegant User Icon badge */}
          <div className="w-10 h-10 bg-slate-50 border border-slate-200/60 rounded-full flex items-center justify-center text-slate-500 shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">{profile.name || 'Usuário'}</span>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                S1-16
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium leading-none mt-1">
              {fitnessLabel}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Status do Peso</span>
          <span className="text-xs text-slate-700 font-mono font-bold">
            {currentWeight ? `${currentWeight.toFixed(1)}kg` : '--'} <span className="text-slate-300 font-sans">/</span> {targetWeight}kg
          </span>
        </div>
      </div>
    );
  }

  // Full / Non-compact Card (renders in ProgressCharts)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* Large Static User Icon badge */}
        <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0">
          <UserIcon className="w-7 h-7" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-800">{profile.name || 'Usuário'}</h3>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono uppercase border border-slate-200/55">
              Plano de 16 Semanas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{fitnessLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-slate-400" />
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase">Peso Atual</span>
            <span className="text-xs font-bold font-mono text-slate-700">{currentWeight ? `${currentWeight.toFixed(1)} kg` : '--'}</span>
          </div>
        </div>
        <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex items-center gap-2.5">
          <Target className="w-4 h-4 text-slate-400" />
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase">Peso Meta</span>
            <span className="text-xs font-bold font-mono text-slate-700">{targetWeight} kg</span>
          </div>
        </div>
      </div>

      {ratio <= 1.05 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[10px] text-emerald-700 font-medium leading-normal">
            Parabéns pela dedicação! Você está muito perto ou já atingiu a sua meta de peso corporal.
          </p>
        </div>
      )}
    </div>
  );
};
