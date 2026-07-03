/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateHealthGuidance } from '../data/healthData';
import {
  Stethoscope,
  Apple,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldAlert,
  Edit3,
  Heart,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface HealthNutritionalGuideProps {
  profile: UserProfile;
  onOpenQuestionnaire?: () => void;
}

export const HealthNutritionalGuide: React.FC<HealthNutritionalGuideProps> = ({
  profile,
  onOpenQuestionnaire,
}) => {
  const [copied, setCopied] = useState(false);
  const guidance = generateHealthGuidance(profile.healthConditions);

  const handleCopyReport = () => {
    let reportText = `=== GUIA DE ADAPTAÇÃO DIETÉTICA E SAÚDE ===\n`;
    reportText += `Paciente/Usuário: ${profile.name || 'Não informado'}\n`;
    reportText += `Condições Ativas: ${guidance.activeConditions.map((c) => c.title).join(', ') || 'Nenhuma informada'}\n\n`;

    if (guidance.superfoods.length > 0) {
      reportText += `--- ALIMENTOS RECOMENDADOS ---\n`;
      guidance.superfoods.forEach((sf) => {
        reportText += `• ${sf.food}: ${sf.reason}\n`;
      });
      reportText += `\n`;
    }

    if (guidance.foodsToAvoid.length > 0) {
      reportText += `--- ALIMENTOS A EVITAR OU CONSUMIR COM CAUTELA ---\n`;
      guidance.foodsToAvoid.forEach((fa) => {
        reportText += `• ${fa.food}: ${fa.reason}\n`;
      });
      reportText += `\n`;
    }

    if (guidance.tips.length > 0) {
      reportText += `--- DICAS E AJUSTES NA DIETA ---\n`;
      guidance.tips.forEach((tip) => {
        reportText += `• [${tip.condition}] ${tip.title}: ${tip.description}\n`;
      });
    }

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="health-nutritional-guide-root" className="flex flex-col gap-6">
      {/* Top Banner: Status & Conditions Summary */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Guia de Nutrição Clínica & Adaptação de Dieta</h2>
              <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Personalizado por Condição
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Diretrizes nutricionais baseadas em evidências para adaptar seu plano alimentar de acordo com diagnósticos de diabetes, hipertensão, SOP, tireoide, colesterol e sensibilidades.
            </p>

            {/* Badges list */}
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {guidance.activeConditions.length > 0 ? (
                guidance.activeConditions.map((cond) => (
                  <span
                    key={cond.id}
                    className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                    {cond.title}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Nenhuma condição de saúde registrada no perfil.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onOpenQuestionnaire && (
            <button
              id="edit-health-assessment-btn"
              onClick={onOpenQuestionnaire}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              {guidance.activeConditions.length > 0 ? 'Editar Questionário' : 'Preencher Questionário'}
            </button>
          )}

          {guidance.activeConditions.length > 0 && (
            <button
              id="copy-health-report-btn"
              onClick={handleCopyReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Copiar Relatório Clínico"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Guia'}
            </button>
          )}
        </div>
      </div>

      {/* Warnings if any */}
      {guidance.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-900 uppercase tracking-wide">Aviso Importante de Acompanhamento Médico:</span>
            {guidance.warnings.map((warn, idx) => (
              <p key={idx} className="text-amber-800 leading-normal">{warn}</p>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Foods: Superfoods vs Foods to Avoid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Superfoods */}
        <div id="superfoods-container" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alimentos Altamente Indicados</h3>
                <p className="text-[11px] text-slate-500">Benefícios terapêuticos e nutricionais diretos</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {guidance.superfoods.length} Sugestões
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {guidance.superfoods.length > 0 ? (
              guidance.superfoods.map((item, index) => (
                <div key={index} className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Apple className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {item.food}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.conditions.map((cond, i) => (
                        <span key={i} className="text-[9px] font-bold bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded-md">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-snug">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Preencha o questionário para ver alimentos recomendados específicos para suas condições.
              </p>
            )}
          </div>
        </div>

        {/* Foods to Limit or Avoid */}
        <div id="foods-avoid-container" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alimentos a Evitar ou Consumir com Cautela</h3>
                <p className="text-[11px] text-slate-500">Podem piorar sintomas ou parâmetros de exames</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              {guidance.foodsToAvoid.length} Alertas
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {guidance.foodsToAvoid.length > 0 ? (
              guidance.foodsToAvoid.map((item, index) => (
                <div key={index} className="bg-rose-50/50 border border-rose-100/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {item.food}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.conditions.map((cond, i) => (
                        <span key={i} className="text-[9px] font-bold bg-rose-200/60 text-rose-900 px-1.5 py-0.5 rounded-md">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-900/80 leading-snug">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                Nenhum alerta de restrição alimentar severa gerado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Tips & Dietary Adapation Strategies */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Estratégias Práticas de Adaptação na Dieta</h3>
              <p className="text-[11px] text-slate-500">Dicas clínicas para otimizar os seus resultados e saúde diária</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidance.tips.map((tip, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {tip.title}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tip.tagBg}`}>
                  {tip.condition}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
