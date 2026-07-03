/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, HealthConditions } from '../types';
import { HEALTH_CONDITIONS_LIST, ConditionInfo } from '../data/healthData';
import { HeartPulse, Check, AlertCircle, ShieldCheck, Stethoscope, ChevronDown, Sparkles } from 'lucide-react';

interface HealthQuestionnaireProps {
  profile: UserProfile;
  onProfileChange: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const HealthQuestionnaire: React.FC<HealthQuestionnaireProps> = ({
  profile,
  onProfileChange,
  onClose,
}) => {
  const [conditions, setConditions] = useState<HealthConditions>(() => {
    return profile.healthConditions || {};
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key: keyof HealthConditions) => {
    setConditions((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
    setSavedSuccess(false);
  };

  const handleFieldChange = (key: keyof HealthConditions, value: any) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      healthConditions: conditions,
    };
    onProfileChange(updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  // Count selected active conditions
  const activeCount = HEALTH_CONDITIONS_LIST.filter((c) => conditions[c.id]).length;

  return (
    <div id="health-questionnaire-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Questionário de Saúde & Condições Clínicas
              {activeCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                  {activeCount} {activeCount === 1 ? 'Condição Selecionada' : 'Condições Selecionadas'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione suas condições de saúde para receber recomendações nutricionais e alertas personalizados.
            </p>
          </div>
        </div>

        <button
          id="save-health-conditions-btn"
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Salvo no Perfil!
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Salvar Avaliação de Saúde
            </>
          )}
        </button>
      </div>

      {/* Main Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HEALTH_CONDITIONS_LIST.map((item: ConditionInfo) => {
          const isChecked = !!conditions[item.id];
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isChecked
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-800'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold leading-tight ${isChecked ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.shortDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra details if Diabetes is checked */}
              {item.id === 'diabetes' && isChecked && (
                <div
                  className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="text-[10px] text-slate-300 font-bold uppercase">Tipo:</label>
                  <select
                    className="bg-slate-800 text-white border border-slate-700 rounded-lg text-xs px-2 py-1 focus:outline-hidden font-semibold"
                    value={conditions.diabetesType || 'type2'}
                    onChange={(e) => handleFieldChange('diabetesType', e.target.value)}
                  >
                    <option value="type2">Diabetes Tipo 2</option>
                    <option value="prediabetes">Pré-diabetes</option>
                    <option value="type1">Diabetes Tipo 1</option>
                    <option value="gestational">Diabetes Gestacional</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Extra Text Fields: Medications & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            Medicamentos em Uso Contínuo (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Metformina, Purtaran, Losartana, Glifage..."
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-slate-400"
            value={conditions.medications || ''}
            onChange={(e) => handleFieldChange('medications', e.target.value)}
          />
          <span className="text-[10px] text-slate-400">Ajuda na verificação de interações com horário das refeições.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Outras Condições ou Sintomas Recorrentes
          </label>
          <input
            type="text"
            placeholder="Ex: Enxaqueca, Esteatose Hepática (gordura no fígado), ansiedade..."
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-slate-400"
            value={conditions.otherConditions || ''}
            onChange={(e) => handleFieldChange('otherConditions', e.target.value)}
          />
          <span className="text-[10px] text-slate-400">Anotações para histórico clínico pessoal.</span>
        </div>
      </div>

      {/* Bottom Save bar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Os dados de saúde são salvos de forma privada no seu perfil e sincronizados na nuvem.
        </p>

        <button
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          Salvar Condições de Saúde
        </button>
      </div>
    </div>
  );
};
