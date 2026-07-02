/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WorkoutEntry, UserProfile, CardioType } from '../types';
import { DEFAULT_CARDIOS } from '../data/defaults';
import { Plus, Trash2, Dumbbell, Flame, Compass, HelpCircle, Activity, Trophy } from 'lucide-react';

interface WorkoutTrackerProps {
  profile: UserProfile;
  workouts: WorkoutEntry[];
  onWorkoutsChange: (newWorkouts: WorkoutEntry[]) => void;
  selectedWeekFilter: number | 'all';
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  profile,
  workouts,
  onWorkoutsChange,
  selectedWeekFilter,
}) => {
  const [type, setType] = useState<'strength' | 'cardio' | 'both'>('strength');
  const [strengthNotes, setStrengthNotes] = useState('');
  const [cardioTypeId, setCardioTypeId] = useState<string>('c7'); // Default: Corrida Moderada
  const [duration, setDuration] = useState<number>(45); // Default 45 mins
  const [formWeek, setFormWeek] = useState<number>(1);

  // Find cardio detail
  const selectedCardio = useMemo(() => {
    return DEFAULT_CARDIOS.find((c) => c.id === cardioTypeId) || DEFAULT_CARDIOS[0];
  }, [cardioTypeId]);

  // Calculate calories burned using clinical MET formula
  // Calories = duration (mins) * MET * 3.5 * weight (kg) / 200
  const calculatedCalories = useMemo(() => {
    const weight = profile.weight || 70;
    if (type === 'strength') {
      // Weight training MET is moderate (3.5)
      return Math.round(duration * 3.5 * 3.5 * weight / 200);
    } else if (type === 'cardio') {
      return Math.round(duration * selectedCardio.met * 3.5 * weight / 200);
    } else {
      // Both: let's assume 45 mins of strength (MET 3.5) and the remaining duration of selected cardio
      const strengthTime = Math.min(duration, 45);
      const cardioTime = Math.max(0, duration - strengthTime);
      const strengthBurn = strengthTime * 3.5 * 3.5 * weight / 200;
      const cardioBurn = cardioTime * selectedCardio.met * 3.5 * weight / 200;
      return Math.round(strengthBurn + cardioBurn);
    }
  }, [type, duration, selectedCardio, profile.weight]);

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();

    const newWorkout: WorkoutEntry = {
      id: `w_${Date.now()}`,
      week: selectedWeekFilter === 'all' ? formWeek : selectedWeekFilter,
      date: new Date().toISOString().split('T')[0],
      type,
      strengthNotes: type !== 'cardio' ? strengthNotes : '',
      cardioType: type !== 'strength' ? selectedCardio.name : '',
      duration,
      caloriesBurned: calculatedCalories,
    };

    onWorkoutsChange([newWorkout, ...workouts]);
    setStrengthNotes('');
    setDuration(45);
  };

  const handleRemoveWorkout = (id: string) => {
    onWorkoutsChange(workouts.filter((w) => w.id !== id));
  };

  // Filter workouts by week
  const filteredWorkouts = useMemo(() => {
    if (selectedWeekFilter === 'all') {
      return workouts;
    }
    return workouts.filter((w) => w.week === selectedWeekFilter);
  }, [workouts, selectedWeekFilter]);

  // Compute total calories burned based on filtered workouts
  const totalBurned = useMemo(() => {
    return filteredWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  }, [filteredWorkouts]);

  return (
    <div id="workout-tracker-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Log form */}
      <div id="workout-form-container" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-800">Registrar Atividade</h2>
        </div>

        <form onSubmit={handleAddWorkout} className="flex flex-col gap-4">
          {/* Workout Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipo de Treino</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="type-strength-btn"
                type="button"
                onClick={() => setType('strength')}
                className={`py-2 text-xs font-bold border rounded-lg transition-all cursor-pointer ${type === 'strength' ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                Musculação
              </button>
              <button
                id="type-cardio-btn"
                type="button"
                onClick={() => setType('cardio')}
                className={`py-2 text-xs font-bold border rounded-lg transition-all cursor-pointer ${type === 'cardio' ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                Cardio
              </button>
              <button
                id="type-both-btn"
                type="button"
                onClick={() => setType('both')}
                className={`py-2 text-xs font-bold border rounded-lg transition-all cursor-pointer ${type === 'both' ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                Ambos
              </button>
            </div>
          </div>

          {/* Conditional notes for Strength */}
          {type !== 'cardio' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Notas da Musculação (Grupamento Muscular)</label>
              <input
                type="text"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden focus:border-slate-400"
                placeholder="Ex: Peito, Ombros e Tríceps"
                value={strengthNotes}
                onChange={(e) => setStrengthNotes(e.target.value)}
              />
            </div>
          )}

          {/* Conditional cardio selector */}
          {type !== 'strength' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipo de Cardio & Intensidade</label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-hidden font-medium"
                value={cardioTypeId}
                onChange={(e) => setCardioTypeId(e.target.value)}
              >
                {DEFAULT_CARDIOS.filter(c => !c.name.includes('Musculação')).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (MET: {c.met})
                  </option>
                ))}
              </select>
            </div>
          )}

           {/* Week of the workout selection */}
          {selectedWeekFilter === 'all' ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Semana do Treino</label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-hidden font-semibold"
                value={formWeek}
                onChange={(e) => setFormWeek(parseInt(e.target.value) || 1)}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semana {i + 1}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Destino do Treino</span>
              <span className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-sm">
                Semana {selectedWeekFilter}
              </span>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Duração Total (minutos)</label>
            <input
              type="number"
              min="1"
              required
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden font-bold"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Estimated Calories card */}
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-slate-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gasto Ativo Estimado</span>
                <p className="text-[10px] text-slate-400 font-medium">Cálculo baseado em MET</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-800 font-mono">{calculatedCalories}</span>
              <span className="text-xs font-bold text-slate-500 ml-1">kcal</span>
            </div>
          </div>

          <button
            id="add-workout-btn"
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar ao Histórico
          </button>
        </form>
      </div>

      {/* Col 2 & 3: History & Science explanations */}
      <div id="workout-history-container" className="lg:col-span-2 flex flex-col gap-6">
        {/* Weekly summaries */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/10 rounded-lg text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Gasto Ativo</span>
              <h3 className="text-base font-bold">Consistência do Processo de Dieta</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Exercícios físicos ajudam a acelerar o déficit calórico diário e a preservar a massa magra.
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400">Total de Gasto Registrado</span>
            <div className="text-2xl font-black mt-0.5 font-mono">{totalBurned} kcal</div>
          </div>
        </div>

        {/* History list */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Registro de Atividades</h3>
            {selectedWeekFilter !== 'all' && (
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                Semana {selectedWeekFilter}
              </span>
            )}
          </div>

          {filteredWorkouts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Activity className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 italic">
                {selectedWeekFilter === 'all' 
                  ? 'Nenhum treino registrado.' 
                  : `Nenhum treino registrado para a Semana ${selectedWeekFilter}.`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
              {filteredWorkouts.map((w) => (
                <div key={w.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-all flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">
                          {w.type === 'strength' ? 'Musculação' : w.type === 'cardio' ? 'Cardio' : 'Musculação + Cardio'}
                        </span>
                        <span className="text-[9px] text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-sm">{w.date}</span>
                        {w.week && (
                          <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                            Semana {w.week}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                        {w.strengthNotes && `Musculação: ${w.strengthNotes}`}
                        {w.strengthNotes && w.cardioType && ' | '}
                        {w.cardioType && `Cardio: ${w.cardioType}`}
                        {` (${w.duration} min)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800 font-mono">+{w.caloriesBurned} kcal</span>
                    <button
                      id={`remove-workout-${w.id}`}
                      onClick={() => handleRemoveWorkout(w.id)}
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

        {/* MET info study card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-slate-500" />
            Metodologia MET (Equivalente Metabólico)
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            O Equivalente Metabólico (MET) quantifica a intensidade e gasto calórico das atividades físicas de acordo com a tabela científica de Ainsworth, adaptando-se com base no seu peso atual e tempo gasto de forma clinicamente válida.
          </p>
        </div>
      </div>
    </div>
  );
};
