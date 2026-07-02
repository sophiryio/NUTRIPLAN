/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MeasurementLog, UserProfile, DailyLog, WorkoutEntry } from '../types';
import { InteractiveAvatar } from './InteractiveAvatar';
import { generateWeeklyReportPDF } from '../services/pdfReport';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Info,
  CheckCircle,
  PlusCircle,
  Sparkles,
  Save,
  Ruler,
  FileText,
} from 'lucide-react';

interface ProgressChartsProps {
  profile: UserProfile;
  onProfileChange: (newProfile: UserProfile) => void;
  measurements: MeasurementLog[];
  onMeasurementsChange: (newMeasurements: MeasurementLog[]) => void;
  selectedWeekFilter?: number | 'all';
  onWeekFilterChange?: (week: number | 'all') => void;
  dailyLogs?: DailyLog[];
  workouts?: WorkoutEntry[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  profile,
  onProfileChange,
  measurements,
  onMeasurementsChange,
  selectedWeekFilter,
  onWeekFilterChange,
  dailyLogs = [],
  workouts = [],
}) => {
  // Currently active week for individual viewing and editing (fallback if no global filter is active)
  const [internalSelectedWeek, setInternalSelectedWeek] = useState<number>(() => {
    // Default to the first week that has no weight yet, or week 1
    const nextUnfilled = measurements.find((m) => !m.weight || m.weight === 0);
    return nextUnfilled ? nextUnfilled.week : 1;
  });

  const selectedWeek = useMemo(() => {
    if (selectedWeekFilter && selectedWeekFilter !== 'all') {
      return selectedWeekFilter;
    }
    return internalSelectedWeek;
  }, [selectedWeekFilter, internalSelectedWeek]);

  const handleWeekChange = (week: number) => {
    const clampedWeek = Math.max(1, Math.min(16, week));
    if (onWeekFilterChange) {
      onWeekFilterChange(clampedWeek);
    } else {
      setInternalSelectedWeek(clampedWeek);
    }
  };

  // State for editing the selected week
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<MeasurementLog | null>(null);

  // Get data for the selected week
  const selectedWeekData = useMemo(() => {
    return measurements.find((m) => m.week === selectedWeek) || null;
  }, [measurements, selectedWeek]);

  // Derived datasets for PDF generation
  const weekLogs = useMemo(() => {
    return dailyLogs.filter((l) => l.week === selectedWeek);
  }, [dailyLogs, selectedWeek]);

  const weekWorkouts = useMemo(() => {
    return workouts.filter((w) => w.week === selectedWeek);
  }, [workouts, selectedWeek]);

  const priorMeasurement = useMemo(() => {
    return measurements.find((m) => m.week === selectedWeek - 1) || null;
  }, [measurements, selectedWeek]);

  const handleGeneratePDF = () => {
    generateWeeklyReportPDF(
      profile,
      selectedWeek,
      weekLogs,
      weekWorkouts,
      selectedWeekData,
      priorMeasurement
    );
  };

  // Handle entering edit mode for the selected week
  const handleStartEdit = () => {
    if (selectedWeekData) {
      setEditForm({ ...selectedWeekData });
      setIsEditing(true);
    }
  };

  // Handle saving the edited week
  const handleSaveWeek = () => {
    if (!editForm) return;
    const updated = measurements.map((m) => (m.week === editForm.week ? editForm : m));
    onMeasurementsChange(updated);
    setIsEditing(false);
    setEditForm(null);
  };

  // Change active week
  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      handleWeekChange(selectedWeek - 1);
      setIsEditing(false);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < 16) {
      handleWeekChange(selectedWeek + 1);
      setIsEditing(false);
    }
  };

  // Prepare chart data (filter to only include weeks that have a logged weight)
  const chartData = useMemo(() => {
    return measurements
      .map((m) => ({
        weekLabel: `S${m.week}`,
        Semana: m.week,
        Peso: m.weight && m.weight > 0 ? m.weight : null,
        Cintura: m.waist && m.waist > 0 ? m.waist : null,
        Quadril: m.hip && m.hip > 0 ? m.hip : null,
        Meta: profile.targetWeight || null,
        raw: m,
      }))
      .filter((d) => d.Peso !== null);
  }, [measurements, profile.targetWeight]);

  // Overall statistics
  const stats = useMemo(() => {
    const startWeight = profile.weight || 0;
    const targetWeight = profile.targetWeight || 0;

    // Find latest recorded weight
    let currentWeight = startWeight;
    let latestWeekNum = 0;
    
    // Scan backwards from Week 16 to find the most recent entry
    for (let w = 16; w >= 1; w--) {
      const log = measurements.find((m) => m.week === w);
      if (log && log.weight && log.weight > 0) {
        currentWeight = log.weight;
        latestWeekNum = w;
        break;
      }
    }

    const totalLost = startWeight - currentWeight;
    const remainingToTarget = currentWeight - targetWeight;
    const percentToTarget = startWeight > targetWeight 
      ? Math.min(100, Math.max(0, (totalLost / (startWeight - targetWeight)) * 100))
      : 0;

    return {
      startWeight,
      currentWeight,
      targetWeight,
      totalLost,
      remainingToTarget,
      percentToTarget,
      latestWeekNum,
    };
  }, [measurements, profile]);

  // Compute minimum and maximum values for Y axis scaling
  const yAxisDomain = useMemo(() => {
    const weights = chartData.map((d) => d.Peso).filter((w): w is number => w !== null);
    if (weights.length === 0) return [60, 100];
    
    const minWeight = Math.min(...weights, profile.targetWeight || 60);
    const maxWeight = Math.max(...weights, profile.weight || 100);
    
    return [
      Math.floor(minWeight - 2),
      Math.ceil(maxWeight + 2)
    ];
  }, [chartData, profile]);

  return (
    <div id="progress-charts-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Stat Cards & Selected Week Detail/Insert Form */}
      <div id="left-progress-panel" className="lg:col-span-1 flex flex-col gap-6">
        
        {/* Bento Stats Header */}
        <div className="bg-slate-900 text-white border border-slate-950 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Resumo de Peso</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Peso Inicial</span>
              <span className="text-xl font-bold font-mono">{stats.startWeight.toFixed(1)} <span className="text-xs">kg</span></span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-xs">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Peso Atual</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {stats.currentWeight.toFixed(1)} <span className="text-xs text-white">kg</span>
              </span>
            </div>
          </div>

          {stats.totalLost > 0 ? (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Eliminado</span>
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    -{stats.totalLost.toFixed(1)} <span className="text-sm font-bold text-white">kg</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Para a Meta ({stats.targetWeight}kg)</span>
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    {stats.remainingToTarget > 0 ? `${stats.remainingToTarget.toFixed(1)} kg` : 'Meta Atingida! 🎉'}
                  </span>
                </div>
              </div>

              {/* Progress bar towards target */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stats.percentToTarget}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 text-right block font-mono">
                {stats.percentToTarget.toFixed(0)}% concluído
              </span>
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-300 italic leading-relaxed pt-2 border-t border-white/10">
              Registre o peso das próximas semanas ao lado para acompanhar seu progresso!
            </div>
          )}
        </div>

        {/* Personagem 2D Interativo e Customizável */}
        <InteractiveAvatar 
          profile={profile} 
          onProfileChange={onProfileChange} 
          measurements={measurements} 
          compact={false} 
        />

        {/* INDIVIDUAL WEEK SELECTION & QUICK DATA FILL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-800">Preencher Semana</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevWeek}
                disabled={selectedWeek === 1}
                className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                title="Semana Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                S{selectedWeek}
              </span>
              <button
                type="button"
                onClick={handleNextWeek}
                disabled={selectedWeek === 16}
                className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                title="Próxima Semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedWeekData && (
            <div className="flex flex-col gap-4">
              {!isEditing ? (
                /* Week Summary View */
                <div className="flex flex-col gap-3">
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-150 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Data da Medição</span>
                      <span className="font-bold text-slate-700 font-mono">
                        {selectedWeekData.date ? new Date(selectedWeekData.date).toLocaleDateString('pt-BR') : 'Não definida'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100/50 pt-2">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-slate-500" /> Peso Registrado
                      </span>
                      <span className="font-black text-slate-800 font-mono text-sm">
                        {selectedWeekData.weight ? `${selectedWeekData.weight.toFixed(1)} kg` : <span className="text-slate-300 font-normal">Pendente</span>}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100/50 pt-2">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-slate-500" /> Cintura / Quadril
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {selectedWeekData.waist && selectedWeekData.hip 
                          ? `${selectedWeekData.waist} / ${selectedWeekData.hip} cm` 
                          : <span className="text-slate-300 font-normal">Pendente</span>}
                      </span>
                    </div>
                  </div>

                  {selectedWeekData.notes && (
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 italic text-slate-600">
                      &ldquo;{selectedWeekData.notes}&rdquo;
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {selectedWeekData.weight ? 'Atualizar Medidas' : 'Inserir Medidas Semanais'}
                  </button>

                  <div className="border-t border-slate-100/60 pt-3 mt-1 flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Relatório da Semana</span>
                    <button
                      type="button"
                      onClick={handleGeneratePDF}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-300" />
                      Gerar PDF Semanal
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Week Inline Form */
                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Data da Medição</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:border-slate-400"
                      value={editForm?.date || ''}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, date: e.target.value } : null)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 75.5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-hidden focus:border-slate-400"
                        value={editForm?.weight || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Cintura (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Cintura"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-hidden focus:border-slate-400"
                        value={editForm?.waist || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, waist: parseFloat(e.target.value) || 0 } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Quadril (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Quadril"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-hidden focus:border-slate-400"
                        value={editForm?.hip || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, hip: parseFloat(e.target.value) || 0 } : null)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Peitoral (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Peitoral"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-hidden focus:border-slate-400"
                        value={editForm?.chest || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, chest: parseFloat(e.target.value) || 0 } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase font-sans">Braço Esq / Dir (cm)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Esq"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-center focus:outline-hidden"
                          value={editForm?.armLeft || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, armLeft: parseFloat(e.target.value) || 0 } : null)}
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Dir"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-center focus:outline-hidden"
                          value={editForm?.armRight || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, armRight: parseFloat(e.target.value) || 0 } : null)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase font-sans">Coxa Esq / Dir (cm)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Esq"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-center focus:outline-hidden"
                          value={editForm?.thighLeft || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, thighLeft: parseFloat(e.target.value) || 0 } : null)}
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Dir"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-center focus:outline-hidden"
                          value={editForm?.thighRight || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, thighRight: parseFloat(e.target.value) || 0 } : null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase font-sans">Notas / Observações</label>
                    <textarea
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 resize-none text-slate-800 focus:outline-hidden focus:border-slate-400"
                      placeholder="Ex: Treinei pesado e segui a dieta 100%"
                      value={editForm?.notes || ''}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(null);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWeek}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Recharts Line Chart Visualization */}
      <div id="right-progress-panel" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Evolução Gráfica do Peso</h3>
            <p className="text-[10px] text-slate-400 font-medium">Acompanhamento visual da sua jornada rumo ao peso alvo</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" /> Peso Registrado
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
              <span className="w-2.5 h-0.5 border-t border-dashed border-rose-500 inline-block" /> Meta ({profile.targetWeight}kg)
            </span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="weekLabel" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <YAxis 
                  domain={yAxisDomain} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#94a3b8" 
                  style={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const weightVal = data.Peso;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-md text-xs flex flex-col gap-1 border border-slate-800">
                          <span className="font-bold text-slate-300">Semana {data.Semana}</span>
                          <span className="font-mono text-slate-200">Peso: <strong className="text-white text-sm">{weightVal.toFixed(1)} kg</strong></span>
                          {data.raw.waist ? (
                            <span className="text-[10px] text-slate-400 font-mono">Cintura: {data.raw.waist} cm | Quadril: {data.raw.hip} cm</span>
                          ) : null}
                          {data.raw.notes ? (
                            <span className="text-[10px] text-slate-400 italic border-t border-slate-800 pt-1 mt-1 max-w-[180px] line-clamp-2">
                              &ldquo;{data.raw.notes}&rdquo;
                            </span>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Baseline reference target weight */}
                {profile.targetWeight && (
                  <ReferenceLine 
                    y={profile.targetWeight} 
                    stroke="#f43f5e" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="Peso"
                  stroke="#1e293b"
                  strokeWidth={2.5}
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#0f172a' }}
                  dot={{ r: 3, strokeWidth: 0, fill: '#475569' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <TrendingDown className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-600 mb-1">Nenhum dado registrado para exibir</h4>
            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              Os pontos do gráfico aparecem automaticamente quando você registra o peso de alguma semana. Selecione uma semana ao lado e comece a registrar!
            </p>
          </div>
        )}

        {/* Dynamic tips based on trend */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex gap-3 items-start text-xs">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700">Acompanhamento Saudável</span>
            <span className="text-slate-500 leading-normal">
              O peso oscila de dia para dia por conta de retenção hídrica, sódio e digestão. O mais importante é focar na <strong className="text-slate-700">tendência geral</strong> no gráfico de semanas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
