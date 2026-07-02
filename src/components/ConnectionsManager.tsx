/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Database,
  Download,
  Upload
} from 'lucide-react';
import { WorkoutEntry, UserProfile, MeasurementLog } from '../types';

interface ConnectionsManagerProps {
  user: User | null;
  accessToken: string | null;
  profile: UserProfile;
  measurements: MeasurementLog[];
  workouts: WorkoutEntry[];
  onSignIn: () => void;
  onImportWorkouts: (newWorkouts: WorkoutEntry[]) => void;
  onImportWeights: (weights: { date: string; weight: number }[]) => void;
  onSaveCloudBackup: () => Promise<void>;
  onRestoreCloudBackup: () => Promise<void>;
}

export const ConnectionsManager: React.FC<ConnectionsManagerProps> = ({
  user,
  profile,
  measurements,
  workouts,
  onSignIn,
  onSaveCloudBackup,
  onRestoreCloudBackup,
}) => {
  const [cloudBackupStatus, setCloudBackupStatus] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleGoogleSignIn = async () => {
    setSignInLoading(true);
    setAuthError(null);
    try {
      await onSignIn();
    } catch (err: any) {
      console.error('Erro de autenticação Google:', err);
      const msg = err?.message || String(err);
      if (
        msg.includes('popup-blocked') || 
        msg.includes('popup_blocked_by_browser') ||
        msg.includes('cancelled-popup') || 
        msg.includes('iframe') || 
        msg.includes('auth/web-storage-unsupported') ||
        msg.includes('auth/iframe-start-fail')
      ) {
        setAuthError(
          'Os navegadores modernos bloqueiam popups do Google dentro de iframes (AI Studio). Clique em "Abrir em Nova Aba" no topo do AI Studio para realizar o login de forma segura!'
        );
      } else {
        setAuthError(`Não foi possível autenticar: ${msg}. Recomendamos abrir o aplicativo em uma Nova Aba.`);
      }
    } finally {
      setSignInLoading(false);
    }
  };

  const handleManualBackup = async () => {
    if (!user) return;
    setCloudBackupStatus('Salvando...');
    try {
      await onSaveCloudBackup();
      setCloudBackupStatus('Backup salvo com sucesso!');
      setTimeout(() => setCloudBackupStatus(null), 3000);
    } catch (e: any) {
      setCloudBackupStatus(`Erro ao salvar: ${e.message}`);
    }
  };

  const handleManualRestore = async () => {
    if (!user) return;
    setCloudBackupStatus('Carregando...');
    try {
      await onRestoreCloudBackup();
      setCloudBackupStatus('Dados restaurados com sucesso!');
      setTimeout(() => setCloudBackupStatus(null), 3000);
    } catch (e: any) {
      setCloudBackupStatus(`Erro ao carregar: ${e.message}`);
    }
  };

  return (
    <div id="connections-manager-root" className="flex flex-col gap-6">
      
      {/* 1. Google Account Cloud Sync Area */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                <Database className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">Salvamento em Nuvem Google</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Evolução Segura na Nuvem</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Conecte sua conta do Google para fazer backup de toda a sua jornada de 16 semanas automaticamente. Acesse seus treinos, metas de dieta e progresso de qualquer dispositivo com segurança total.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs shrink-0 flex flex-col sm:flex-row items-center gap-4">
            {!user ? (
              <button
                id="google-fit-connect-btn"
                onClick={handleGoogleSignIn}
                disabled={signInLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all cursor-pointer transform hover:scale-[1.02] disabled:opacity-50"
              >
                {signInLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                )}
                {signInLoading ? 'Conectando...' : 'Conectar Conta Google'}
              </button>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">G</div>
                  )}
                  <div>
                    <span className="text-[10px] text-indigo-200 block font-bold uppercase">CONECTADO</span>
                    <span className="text-xs text-white font-semibold block">{user.displayName || user.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualBackup}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Fazer Backup
                  </button>
                  <button
                    onClick={handleManualRestore}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3 h-3" /> Restaurar
                  </button>
                </div>

                {cloudBackupStatus && (
                  <span className="text-[10px] text-indigo-300 font-mono text-center block mt-1">{cloudBackupStatus}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning Callout for iframe (proactive) */}
        {isInIframe && !user && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/35 rounded-xl p-3 text-xs text-amber-200 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-amber-300 mb-0.5">Executando no Painel do AI Studio</span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Navegadores modernos impedem que popups do Google abram corretamente dentro de iframes incorporados. Para autenticar com total sucesso, 
                <strong> abra este app em uma Nova Aba</strong> clicando no botão com ícone de seta/link externo <span className="inline-flex bg-white/10 px-1 py-0.2 rounded font-mono text-[9px]">↗</span> no canto superior direito da tela do AI Studio para experimentar!
              </p>
            </div>
          </div>
        )}

        {/* Detailed Auth Error Callout */}
        {authError && (
          <div className="mt-4 bg-red-500/15 border border-red-500/35 rounded-xl p-3.5 text-xs text-red-200 flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-red-300 mb-0.5">Pendência de Autenticação / Restrição de Navegador</span>
              <p className="text-[11px] leading-relaxed text-slate-300 mb-2">
                {authError}
              </p>
              <a 
                href={typeof window !== 'undefined' ? window.location.href : '#'} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
              >
                Abrir App em Nova Aba ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 2. Reset Local Data Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            Reiniciar Aplicativo / Começar do Zero
          </h3>
          <p className="text-xs text-slate-500 leading-normal max-w-xl">
            Deseja apagar todos os registros offline salvos no seu navegador para começar uma nova jornada totalmente limpa? Se tiver feito backup em nuvem, você poderá recuperá-los depois.
          </p>
        </div>
        <div>
          {confirmReset ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetData}
                className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Confirmar Limpeza
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="py-2 px-4 bg-white border border-rose-200 hover:border-rose-300 text-rose-600 font-semibold rounded-lg text-xs cursor-pointer transition-all hover:bg-rose-50/20 text-nowrap"
            >
              Apagar Dados Locais
            </button>
          )}
        </div>
      </div>

      {/* Informativo de Segurança */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-600 mt-2">
        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <strong className="text-slate-850">Garantia de Privacidade &amp; Segurança Google Cloud:</strong>
          <span className="text-slate-700">
            Ao salvar seus backups no app, todos os seus dados de metas, diário alimentar, treinos e medidas de 16 semanas são criptografados e armazenados com total segurança em seu perfil dedicado do Google Cloud Firestore. Seus dados pessoais e de evolução são totalmente privativos e protegidos.
          </span>
        </div>
      </div>

    </div>
  );
};
