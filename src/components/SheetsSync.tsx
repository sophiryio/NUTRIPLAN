/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import { SyncStatus } from '../types';
import { LogOut, RefreshCw, FileSpreadsheet, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface SheetsSyncProps {
  user: User | null;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
  onCreateSpreadsheet: () => void;
  onSyncNow: () => void;
}

export const SheetsSync: React.FC<SheetsSyncProps> = ({
  user,
  syncStatus,
  onSignIn,
  onSignOut,
  onCreateSpreadsheet,
  onSyncNow,
}) => {
  return (
    <div id="sheets-sync-container" className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Section: Connection Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
            <FileSpreadsheet id="sheets-icon" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-800">Sincronização com Google Sheets</h3>
            <p className="text-xs text-slate-500">
              {!user ? (
                'Conecte sua conta para salvar sua dieta e treinos diretamente em uma planilha do Google Drive.'
              ) : syncStatus.spreadsheetId ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Planilha sincronizada e ativa
                </span>
              ) : (
                'Conta conectada. Crie uma nova planilha para começar a sincronizar.'
              )}
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {!user ? (
            <button
              id="gsi-login-button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Conectar com o Google</span>
            </button>
          ) : (
            <>
              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs">
                {user.photoURL && (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span>{user.displayName || user.email}</span>
              </div>

              {/* Action buttons */}
              {syncStatus.spreadsheetId ? (
                <>
                  <a
                    id="open-sheet-link"
                    href={syncStatus.spreadsheetUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Planilha
                  </a>
                  <button
                    id="sync-now-button"
                    onClick={onSyncNow}
                    disabled={syncStatus.isSyncing}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </button>
                </>
              ) : (
                <button
                  id="create-sheet-button"
                  onClick={onCreateSpreadsheet}
                  disabled={syncStatus.isSyncing}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Criar Planilha no Sheets
                </button>
              )}

              {/* Log out */}
              <button
                id="sign-out-button"
                onClick={onSignOut}
                title="Desconectar"
                className="p-2 bg-white border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sync Status Notifications */}
      {user && (syncStatus.lastSynced || syncStatus.error) && (
        <div className="max-w-7xl mx-auto mt-3">
          {syncStatus.error ? (
            (() => {
              const isApiDisabled = syncStatus.error.includes('sheets.googleapis.com') || 
                                    syncStatus.error.includes('Sheets API has not been used') ||
                                    syncStatus.error.includes('disabled');
              
              // Extract the console URL from error if possible
              const urlMatch = syncStatus.error.match(/https:\/\/console\.(?:developers\.)?google\.com\/[^\s'"]+/);
              const consoleUrl = urlMatch ? urlMatch[0] : 'https://console.developers.google.com/apis/api/sheets.googleapis.com/overview';

              if (isApiDisabled) {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs mt-2 flex flex-col md:flex-row gap-4 items-start justify-between">
                    <div className="flex gap-2.5 items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 block text-sm mb-1">
                          Ação Necessária: Ativar a API do Google Sheets 🔑
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed max-w-2xl">
                          A API do Google Sheets precisa estar habilitada em seu projeto Google Cloud para que possamos ler e gravar em sua planilha automaticamente. 
                          Siga as instruções de ativação abaixo:
                        </p>
                        <ol className="text-[11px] text-slate-600 space-y-1 mt-2 list-decimal list-inside">
                          <li>Clique no botão azul <strong>"Ativar API no Google Cloud"</strong> à direita.</li>
                          <li>Na página oficial do Google Cloud que abrir, verifique se seu projeto atual está selecionado no topo.</li>
                          <li>Clique no botão azul <strong>"Ativar" (Enable)</strong> e aguarde cerca de 1 a 2 minutos.</li>
                          <li>Volte para esta aba do applet e clique em <strong>"Criar Planilha no Sheets"</strong> novamente!</li>
                        </ol>
                      </div>
                    </div>
                    <a 
                      href={consoleUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-lg text-[11px] transition-colors shadow-xs w-full md:w-auto text-center"
                    >
                      Ativar API no Google Cloud ↗
                    </a>
                  </div>
                );
              }

              const isScopeIssue = syncStatus.error.toLowerCase().includes('scope') || 
                                   syncStatus.error.toLowerCase().includes('permission') ||
                                   syncStatus.error.toLowerCase().includes('unauthorized') ||
                                   syncStatus.error.toLowerCase().includes('escopo');

              if (isScopeIssue) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs mt-2">
                    <div className="flex gap-2.5 items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-800 block text-sm mb-1">
                          Permissões do Google Sheets Ausentes 🔐
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          Sua conta conectou com sucesso, mas o acesso para criar/escrever planilhas não foi autorizado ou as caixas de seleção correspondentes foram desmarcadas.
                        </p>
                        <p className="text-[11px] text-slate-600 mt-2">
                          <strong>Para corrigir isso de forma simples:</strong>
                        </p>
                        <ol className="text-[11px] text-slate-600 space-y-1 mt-1 list-decimal list-inside">
                          <li>Clique no botão de deslogar (ícone de saída cinza <span className="inline-flex align-middle bg-slate-200 px-1 py-0.2 rounded"><LogOut className="w-2.5 h-2.5" /></span> no canto superior direito) para desconectar sua conta atual.</li>
                          <li>Clique no botão <strong>"Conectar com o Google"</strong> novamente.</li>
                          <li>Na tela de login do Google, lembre-se de <strong>marcar e consentir com todas as caixas de seleção de escopos de permissão</strong> apresentadas (para gerenciar planilhas).</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                );
              }

              // Default Error Card
              return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs mt-2 flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-850">Falha na Sincronização</span>
                    <p className="mt-0.5 text-[11px] text-red-700 leading-relaxed">{syncStatus.error}</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="flex justify-end text-[10px] text-slate-400">
              Última sincronização completa: {syncStatus.lastSynced}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
