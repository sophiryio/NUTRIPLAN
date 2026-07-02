/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MeasurementLog, WorkoutEntry, DailyLog } from '../types';
import { Ruler, Edit, Save, ArrowDown, TrendingDown, Scale, BarChart2, Dumbbell, Utensils, Info, Check, AlertCircle } from 'lucide-react';

interface MeasurementsTrackerProps {
  measurements: MeasurementLog[];
  onMeasurementsChange: (newMeasurements: MeasurementLog[]) => void;
  selectedWeekFilter: number | 'all';
  onWeekFilterChange: (week: number | 'all') => void;
  workouts: WorkoutEntry[];
  dailyLogs: DailyLog[];
}

export const MeasurementsTracker: React.FC<MeasurementsTrackerProps> = ({
  measurements,
  onMeasurementsChange,
  selectedWeekFilter,
  onWeekFilterChange,
  workouts,
  dailyLogs,
}) => {
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MeasurementLog | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);

  // Filter measurements based on global week filter and toggle
  const displayedMeasurements = useMemo(() => {
    if (selectedWeekFilter === 'all' || !showOnlySelected) {
      return measurements;
    }
    return measurements.filter((m) => m.week === selectedWeekFilter);
  }, [measurements, selectedWeekFilter, showOnlySelected]);

  // Compute overall progress metrics (Week 1 vs Latest filled week)
  const progressMetrics = useMemo(() => {
    const week1 = measurements.find((m) => m.week === 1);
    if (!week1 || !week1.weight) return null;

    // Find the latest week that has weight filled (other than week 1, if possible)
    let latestFilled = week1;
    for (let w = 16; w > 1; w--) {
      const m = measurements.find((item) => item.week === w);
      if (m && m.weight && m.weight > 0) {
        latestFilled = m;
        break;
      }
    }

    if (latestFilled.week === 1) return { weightLoss: 0, waistLoss: 0, hipLoss: 0 };

    return {
      weightLoss: week1.weight - latestFilled.weight,
      waistLoss: (week1.waist || 0) - (latestFilled.waist || 0),
      hipLoss: (week1.hip || 0) - (latestFilled.hip || 0),
      latestWeek: latestFilled.week,
    };
  }, [measurements]);

  const handleEditClick = (weekLog: MeasurementLog) => {
    setEditingWeek(weekLog.week);
    setEditForm({ ...weekLog });
  };

  const handleFormChange = (field: keyof MeasurementLog, value: any) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [field]: value,
    });
  };

  const handleSaveClick = () => {
    if (!editForm) return;
    const updated = measurements.map((m) => (m.week === editForm.week ? editForm : m));
    onMeasurementsChange(updated);
    setEditingWeek(null);
    setEditForm(null);
  };

  return (
    <div id="measurements-tracker-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Progress Summary Bento cards */}
      <div id="progress-summary-container" className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-5">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-800 font-sans">Evolução do Plano</h2>
          </div>

          {progressMetrics && progressMetrics.weightLoss > 0 ? (
            <div className="flex flex-col gap-4">
              {/* Weight Lost card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Eliminado até a Semana {progressMetrics.latestWeek}</span>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <ArrowDown className="w-5 h-5 text-slate-800 animate-bounce" />
                  <span className="text-2xl font-black text-slate-800 font-mono">
                    {progressMetrics.weightLoss.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">kg</span>
                </div>
              </div>

              {/* Waist reduction */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Redução de Cintura</span>
                <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-sm">
                  {progressMetrics.waistLoss > 0 ? `-${progressMetrics.waistLoss.toFixed(1)} cm` : '0 cm'}
                </span>
              </div>

              {/* Hip reduction */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Redução de Quadril</span>
                <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-sm">
                  {progressMetrics.hipLoss > 0 ? `-${progressMetrics.hipLoss.toFixed(1)} cm` : '0 cm'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400 italic">
              Preencha os dados das próximas semanas para ver sua evolução estética de medidas.
            </div>
          )}
        </div>

        {/* Tip section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Ruler className="w-4 h-4 text-slate-500" />
            Dica para Medição Perfeita
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            Meça sempre pela manhã em jejum. Mantenha a fita métrica firme contra a pele, mas sem apertar.
            A cintura deve ser medida na linha mais fina e o quadril na parte mais larga dos glúteos.
          </p>
        </div>
      </div>

      {/* Col 2 & 3: Weekly Measurements Timeline Table */}
      <div id="measurements-timeline-container" className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-slate-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Planilha das 16 Semanas
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Selecione qualquer linha para focar o cronograma global na respectiva semana.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {selectedWeekFilter !== 'all' && (
              <label className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 w-3.5 h-3.5 cursor-pointer"
                  checked={showOnlySelected}
                  onChange={(e) => setShowOnlySelected(e.target.checked)}
                />
                Filtrar apenas Semana {selectedWeekFilter}
              </label>
            )}
            
            {selectedWeekFilter !== 'all' && (
              <button
                id="clear-measurements-filter-btn"
                onClick={() => {
                  onWeekFilterChange('all');
                  setShowOnlySelected(false);
                }}
                className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Limpar Filtro Global
              </button>
            )}
            
            {selectedWeekFilter === 'all' && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-sm uppercase font-sans">
                Visão Geral Ativa
              </span>
            )}
          </div>
        </div>

        {/* Editing Modal or Floating panel */}
        {editingWeek !== null && editForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700">Editando Semana {editForm.week}</span>
              <button
                id="save-week-measurements-btn"
                onClick={handleSaveClick}
                className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1 px-3 rounded-lg cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Data</label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                  value={editForm.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono"
                  value={editForm.weight || ''}
                  onChange={(e) => handleFormChange('weight', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  value={editForm.waist || ''}
                  onChange={(e) => handleFormChange('waist', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quadril (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  value={editForm.hip || ''}
                  onChange={(e) => handleFormChange('hip', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Peitoral (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono"
                  value={editForm.chest || ''}
                  onChange={(e) => handleFormChange('chest', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Braço Esq / Dir (cm)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Esq"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                    value={editForm.armLeft || ''}
                    onChange={(e) => handleFormChange('armLeft', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Dir"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                    value={editForm.armRight || ''}
                    onChange={(e) => handleFormChange('armRight', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Coxa Esq / Dir (cm)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Esq"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                    value={editForm.thighLeft || ''}
                    onChange={(e) => handleFormChange('thighLeft', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Dir"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                    value={editForm.thighRight || ''}
                    onChange={(e) => handleFormChange('thighRight', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Notas / Observação</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                  placeholder="Ex: Treinei super bem"
                  value={editForm.notes || ''}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Timeline Table */}
        <div className="overflow-x-auto border border-slate-150 rounded-xl">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-3 font-semibold text-slate-700">Semana</th>
                <th className="p-3 font-semibold text-slate-700">Consistência</th>
                <th className="p-3 font-semibold text-slate-700">Data</th>
                <th className="p-3 font-semibold text-slate-700">Peso (kg)</th>
                <th className="p-3 font-semibold text-slate-700">Cintura / Quadril</th>
                <th className="p-3 font-semibold text-slate-700">Braços (E/D)</th>
                <th className="p-3 font-semibold text-slate-700">Coxas (E/D)</th>
                <th className="p-3 font-semibold text-slate-700">Notas</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMeasurements.map((m) => {
                const isSelected = selectedWeekFilter === m.week;
                
                // Calculate consistency statistics for this week
                const weekWorkouts = workouts.filter((w) => w.week === m.week);
                const weekDiet = dailyLogs.filter((log) => log.week === m.week);
                const daysWithDiet = weekDiet.filter((log) => 
                  log.meals.some((meal) => meal.entries.length > 0) || log.waterIntake > 2000
                ).length;

                // Calculate weight change compared to previous week
                const prevWeekLog = measurements.find((p) => p.week === m.week - 1);
                const weightDiff = (m.weight && prevWeekLog && prevWeekLog.weight)
                  ? m.weight - prevWeekLog.weight
                  : null;

                return (
                  <tr
                    key={m.week}
                    onClick={() => {
                      if (editingWeek !== m.week) {
                        onWeekFilterChange(m.week);
                      }
                    }}
                    className={`transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/60 font-medium border-l-4 border-l-slate-900'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>Semana {m.week}</span>
                        {isSelected && (
                          <span className="text-[8px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Foco
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <span
                          title={`${weekWorkouts.length} treino(s) registrado(s)`}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            weekWorkouts.length > 0
                              ? 'bg-slate-100 text-slate-700 border border-slate-200/50'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Dumbbell className="w-3 h-3 text-slate-600" />
                          {weekWorkouts.length}t
                        </span>
                        <span
                          title={`${daysWithDiet} de 7 dias de dieta preenchidos`}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            daysWithDiet > 0
                              ? 'bg-slate-100 text-slate-700 border border-slate-200/50'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Utensils className="w-3 h-3 text-slate-600" />
                          {daysWithDiet}/7d
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-medium">
                      <span>{m.date}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-800 font-mono">
                      {m.weight ? (
                        <div>
                          <span>{m.weight.toFixed(1)} kg</span>
                          {weightDiff !== null && (
                            <div className="text-[10px] font-semibold mt-0.5">
                              {weightDiff < 0 ? (
                                <span className="text-slate-800">-{Math.abs(weightDiff).toFixed(1)} kg</span>
                              ) : weightDiff > 0 ? (
                                <span className="text-amber-600">+{weightDiff.toFixed(1)} kg</span>
                              ) : (
                                <span className="text-slate-400">0.0 kg</span>
                              )}
                            </div>
                          )}
                          {m.week === 1 && (
                            <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">Inicial</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-medium">
                      {m.waist && m.hip ? (
                        <span>{m.waist} / {m.hip} cm</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {m.armLeft && m.armRight ? (
                        <span>{m.armLeft} / {m.armRight}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {m.thighLeft && m.thighRight ? (
                        <span>{m.thighLeft} / {m.thighRight}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3 italic text-slate-500 max-w-xs truncate" title={m.notes}>
                      {m.notes ? <span>{m.notes}</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`edit-week-${m.week}-btn`}
                        onClick={(e) => {
                          e.stopPropagation();
                           handleEditClick(m);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Editar medidas desta semana"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
