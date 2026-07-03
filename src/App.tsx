/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, MeasurementLog, DailyLog, WorkoutEntry, SyncStatus } from './types';
import {
  INITIAL_PROFILE,
  INITIAL_MEASUREMENTS,
  INITIAL_DAILY_LOGS,
  INITIAL_WORKOUTS,
  calculateBMR,
  calculateTDEE,
  calculateTargetMacros
} from './data/defaults';
import { initAuth, googleSignIn, googleSignOut } from './services/firebaseAuth';
import { createDietSpreadsheet, syncDataToSpreadsheet } from './services/googleSheets';
import { saveUserDataToCloud, loadUserDataFromCloud } from './services/firestoreSync';
import { SheetsSync } from './components/SheetsSync';
import { MetricCalculator } from './components/MetricCalculator';
import { MealPlanner } from './components/MealPlanner';
import { WorkoutTracker } from './components/WorkoutTracker';
import { MeasurementsTracker } from './components/MeasurementsTracker';
import { ProgressCharts } from './components/ProgressCharts';
import { InteractiveAvatar } from './components/InteractiveAvatar';
import { ConnectionsManager } from './components/ConnectionsManager';
import { HealthQuestionnaire } from './components/HealthQuestionnaire';
import { HealthNutritionalGuide } from './components/HealthNutritionalGuide';
import { Dumbbell, Ruler, Scale, Utensils, Award, Compass, Heart, Activity, LineChart, Calendar, Database, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // --- Local Persistence State Load ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const local = localStorage.getItem('diet_profile');
    return local ? JSON.parse(local) : INITIAL_PROFILE;
  });

  const [measurements, setMeasurements] = useState<MeasurementLog[]>(() => {
    const local = localStorage.getItem('diet_measurements');
    return local ? JSON.parse(local) : INITIAL_MEASUREMENTS(profile.startDate);
  });

  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');

  const [selectedDay, setSelectedDay] = useState<number>(1);

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const local = localStorage.getItem('diet_daily_logs');
    let logs = local ? JSON.parse(local) : INITIAL_DAILY_LOGS(profile.startDate);
    
    if (!Array.isArray(logs)) {
      logs = INITIAL_DAILY_LOGS(profile.startDate);
    }
    
    // Ensure we have exactly 112 daily logs (16 weeks * 7 days)
    if (logs.length < 112) {
      const paddedLogs: DailyLog[] = [];
      const initialTemplate = INITIAL_DAILY_LOGS(profile.startDate)[0];
      const baseDate = profile.startDate ? new Date(profile.startDate + 'T00:00:00') : new Date();
      
      for (let w = 1; w <= 16; w++) {
        for (let d = 1; d <= 7; d++) {
          // Look for an existing log with this week and day
          let existing = logs.find((l) => l.week === w && l.day === d);
          if (!existing && d === 1) {
            // Fallback to legacy log that only had week
            existing = logs.find((l) => l.week === w && !l.day);
          }
          
          if (existing) {
            paddedLogs.push({
              ...existing,
              week: w,
              day: d,
              date: existing.date || (() => {
                const dateCopy = new Date(baseDate);
                dateCopy.setDate(baseDate.getDate() + ((w - 1) * 7 + (d - 1)));
                return dateCopy.toISOString().split('T')[0];
              })(),
            });
          } else {
            const dateCopy = new Date(baseDate);
            dateCopy.setDate(baseDate.getDate() + ((w - 1) * 7 + (d - 1)));
            const dateStr = dateCopy.toISOString().split('T')[0];
            
            paddedLogs.push({
              week: w,
              day: d,
              date: dateStr,
              waterIntake: 2000,
              meals: initialTemplate.meals.map((meal) => ({
                id: meal.id,
                name: meal.name,
                entries: [],
              })),
            });
          }
        }
      }
      return paddedLogs;
    }
    return logs;
  });

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => {
    const local = localStorage.getItem('diet_workouts');
    return local ? JSON.parse(local) : INITIAL_WORKOUTS();
  });

  // --- Auth & Sync State ---
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    const storedId = localStorage.getItem('sheets_spreadsheet_id');
    const storedUrl = localStorage.getItem('sheets_spreadsheet_url');
    const storedSynced = localStorage.getItem('sheets_last_synced');
    return {
      spreadsheetId: storedId || null,
      spreadsheetUrl: storedUrl || null,
      isSyncing: false,
      lastSynced: storedSynced || null,
      error: null,
    };
  });

  // --- Active Navigation Tab ---
  const [activeTab, setActiveTab] = useState<'metas' | 'dieta' | 'treinos' | 'medidas' | 'progresso' | 'saude' | 'conexoes'>('metas');

  // --- Sync State to LocalStorage on Change ---
  useEffect(() => {
    localStorage.setItem('diet_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('diet_measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('diet_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('diet_workouts', JSON.stringify(workouts));
  }, [workouts]);

  // --- Diet Start Date Modification Handler ---
  const handleStartDateChange = (newStartDate: string) => {
    // 1. Calculate the offset difference in days
    const oldStart = profile.startDate ? new Date(profile.startDate + 'T00:00:00') : new Date();
    const newStart = new Date(newStartDate + 'T00:00:00');
    const diffTime = newStart.getTime() - oldStart.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // 2. Update the profile with the new start date
    setProfile((prev) => ({
      ...prev,
      startDate: newStartDate,
    }));

    // 3. Shift dates of dailyLogs sequentially starting from startDate
    const baseDate = new Date(newStartDate + 'T00:00:00');
    setDailyLogs((prevLogs) =>
      prevLogs.map((log) => {
        const w = log.week || 1;
        const d = log.day || 1;
        const dateCopy = new Date(baseDate);
        dateCopy.setDate(baseDate.getDate() + ((w - 1) * 7 + (d - 1)));
        return {
          ...log,
          date: dateCopy.toISOString().split('T')[0],
        };
      })
    );

    // 4. Shift dates of measurements sequentially
    setMeasurements((prevMeasurements) =>
      prevMeasurements.map((m) => {
        const w = m.week;
        const dateCopy = new Date(baseDate);
        dateCopy.setDate(baseDate.getDate() + (w - 1) * 7);
        return {
          ...m,
          date: dateCopy.toISOString().split('T')[0],
        };
      })
    );

    // 5. Shift dates of workouts by the same delta days
    if (diffDays !== 0) {
      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((w) => {
          try {
            const wDate = new Date(w.date + 'T00:00:00');
            wDate.setDate(wDate.getDate() + diffDays);
            return {
              ...w,
              date: wDate.toISOString().split('T')[0],
            };
          } catch (e) {
            return w;
          }
        })
      );
    }
  };

  const [hasPromptedCloud, setHasPromptedCloud] = useState(false);

  // --- Auth state listener initialization ---
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setHasPromptedCloud(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger cloud restoration or initial backup creation when user signs in
  useEffect(() => {
    if (user && !hasPromptedCloud) {
      const loadAndCheckBackup = async () => {
        try {
          const cloudData = await loadUserDataFromCloud(user.uid);
          if (cloudData) {
            const confirmRestore = window.confirm(
              `Encontramos um backup da sua jornada na nuvem Google (atualizado em: ${new Date(cloudData.updatedAt).toLocaleString('pt-BR')}).\n\nDeseja RESTAURAR esses dados na nuvem para este dispositivo? (Isso substituirá seus dados locais)`
            );
            if (confirmRestore) {
              if (cloudData.profile) setProfile(cloudData.profile);
              if (cloudData.measurements) setMeasurements(cloudData.measurements);
              if (cloudData.dailyLogs) setDailyLogs(cloudData.dailyLogs);
              if (cloudData.workouts) setWorkouts(cloudData.workouts);
              alert('Dados restaurados da nuvem com sucesso!');
            } else {
              const confirmSave = window.confirm(
                'Deseja salvar seus dados locais atuais na nuvem para manter seu backup atualizado?'
              );
              if (confirmSave) {
                await saveUserDataToCloud(user.uid, profile, measurements, dailyLogs, workouts);
                alert('Backup em nuvem atualizado!');
              }
            }
          } else {
            // No backup exists on cloud, back up current local data automatically
            await saveUserDataToCloud(user.uid, profile, measurements, dailyLogs, workouts);
          }
          setHasPromptedCloud(true);
        } catch (err) {
          console.error('Falha ao sincronizar dados na nuvem:', err);
        }
      };
      loadAndCheckBackup();
    }
  }, [user, hasPromptedCloud]);

  // Debounced auto-save effect
  useEffect(() => {
    if (user && hasPromptedCloud) {
      const delayDebounce = setTimeout(async () => {
        try {
          await saveUserDataToCloud(user.uid, profile, measurements, dailyLogs, workouts);
          console.log('Saved backup to firestore successfully.');
        } catch (e) {
          console.error('Auto-save to cloud failed:', e);
        }
      }, 3000); // 3 seconds debounce
      return () => clearTimeout(delayDebounce);
    }
  }, [profile, measurements, dailyLogs, workouts, user, hasPromptedCloud]);

  const handleSaveCloudBackup = async () => {
    if (!user) return;
    await saveUserDataToCloud(user.uid, profile, measurements, dailyLogs, workouts);
  };

  const handleRestoreCloudBackup = async () => {
    if (!user) return;
    const cloudData = await loadUserDataFromCloud(user.uid);
    if (cloudData) {
      if (cloudData.profile) setProfile(cloudData.profile);
      if (cloudData.measurements) setMeasurements(cloudData.measurements);
      if (cloudData.dailyLogs) setDailyLogs(cloudData.dailyLogs);
      if (cloudData.workouts) setWorkouts(cloudData.workouts);
    } else {
      throw new Error('Nenhum backup encontrado na nuvem para sua conta.');
    }
  };

  // --- Auth Handlers ---
  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setSyncStatus((prev) => ({ ...prev, error: 'Falha ao conectar com o Google.' }));
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      setHasPromptedCloud(false);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  // --- Sheets Sync Handlers ---
  const handleCreateSpreadsheet = async () => {
    console.group('📊 [Google Sheets Sync] handleCreateSpreadsheet');
    console.log('Iniciando criação de planilha...');
    console.log('Acessando token ativo:', accessToken ? `Sim (Inicia com: ${accessToken.substring(0, 15)}...)` : 'Não (Token nulo/indefinido)');
    console.log('Usuário autenticado:', user ? { uid: user.uid, email: user.email } : 'Nenhum');
    console.log('Perfil atual para a planilha:', { name: profile.name, targetWeight: profile.targetWeight });

    if (!accessToken) {
      console.error('Erro: Tentativa de criar planilha sem token de acesso ativo!');
      console.groupEnd();
      return;
    }
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const sheetName = `Plano de Dieta e Treino de 16 Semanas - ${profile.name}`;
      console.log('Chamando createDietSpreadsheet com nome:', sheetName);
      
      const { spreadsheetId, spreadsheetUrl } = await createDietSpreadsheet(accessToken, sheetName);
      
      console.log('Planilha criada com sucesso no Google Drive!');
      console.log('ID retornado da Planilha:', spreadsheetId);
      console.log('URL de edição da Planilha:', spreadsheetUrl);

      // Save sheet info to state and localStorage
      localStorage.setItem('sheets_spreadsheet_id', spreadsheetId);
      localStorage.setItem('sheets_spreadsheet_url', spreadsheetUrl);
      
      setSyncStatus((prev) => ({
        ...prev,
        spreadsheetId,
        spreadsheetUrl,
        isSyncing: false,
        error: null,
      }));

      // Immediately run first sync to populate newly created sheet
      console.log('Iniciando sincronização inicial imediata para preencher as abas...');
      await triggerSync(spreadsheetId, accessToken);
      console.log('Sincronização inicial finalizada.');
    } catch (err: any) {
      console.error('Falha em handleCreateSpreadsheet:', err);
      console.error('Mensagem do erro:', err?.message || err);
      console.error('Dica de Depuração: Verifique se sua conta do Google possui o escopo de Planilhas Google habilitado ou se há erros de rede.');
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Falha ao criar planilha no Google Drive.',
      }));
    } finally {
      console.groupEnd();
    }
  };

  const handleSyncNow = async () => {
    console.group('🔄 [Google Sheets Sync] handleSyncNow');
    console.log('Clique em Sincronizar Agora detectado.');
    console.log('Verificando condições de sincronização:');
    console.log('- Token de acesso presente:', !!accessToken);
    console.log('- ID da planilha presente:', syncStatus.spreadsheetId);

    if (!accessToken || !syncStatus.spreadsheetId) {
      console.warn('Sincronização abortada: Token de acesso ou ID da planilha ausente.');
      console.groupEnd();
      return;
    }
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      await triggerSync(syncStatus.spreadsheetId, accessToken);
      console.log('handleSyncNow concluído com sucesso!');
    } catch (err: any) {
      console.error('Falha em handleSyncNow:', err);
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Falha ao sincronizar dados.',
      }));
    } finally {
      console.groupEnd();
    }
  };

  const triggerSync = async (sheetId: string, token: string) => {
    console.group(`🔄 [Google Sheets Sync] triggerSync - ID: ${sheetId}`);
    console.log('Iniciando empacotamento de dados...');
    console.log('Token de acesso fornecido:', token ? `Sim (Inicia com: ${token.substring(0, 15)}...)` : 'Não');

    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile, bmr);
    const targetCalories = profile.isManualMacros && profile.manualCalories
      ? profile.manualCalories
      : Math.max(1200, tdee - profile.weeklyDeficitTarget);
    const targetMacros = calculateTargetMacros(profile, targetCalories);

    console.log('Métricas corporais calculadas no frontend:', { bmr, tdee, targetCalories, targetMacros });
    console.log('Contagens de registros a enviar:');
    console.log(`- Medidas corporais: ${measurements.length} registro(s)`);
    console.log(`- Diário Alimentar: ${dailyLogs.length} registro(s)`);
    console.log(`- Histórico de Treinos: ${workouts.length} registro(s)`);

    try {
      console.log('Disparando chamada da API syncDataToSpreadsheet no arquivo de serviço...');
      await syncDataToSpreadsheet(
        token,
        sheetId,
        profile,
        tdee,
        bmr,
        targetCalories,
        targetMacros,
        measurements,
        dailyLogs,
        workouts
      );
      console.log('API syncDataToSpreadsheet respondida com Sucesso!');

      const nowStr = new Date().toLocaleString('pt-BR');
      localStorage.setItem('sheets_last_synced', nowStr);
      
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSynced: nowStr,
        error: null,
      }));
      console.log('Data da última sincronização atualizada localmente:', nowStr);
    } catch (err: any) {
      console.error('Erro detectado dentro da execução de triggerSync:', err);
      console.error('Possível causa: Credenciais expiradas, planilha deletada ou escopo insuficiente.');
      throw err;
    } finally {
      console.groupEnd();
    }
  };

  const handleImportWorkouts = (newWorkouts: WorkoutEntry[]) => {
    setWorkouts((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const filtered = newWorkouts.filter((w) => !existingIds.has(w.id));
      if (filtered.length === 0) return prev;
      return [...filtered, ...prev];
    });
  };

  const handleImportWeights = (importedWeights: { date: string; weight: number }[]) => {
    setMeasurements((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        const match = importedWeights.find((w) => w.date === m.date);
        if (match && match.weight > 0 && m.weight !== match.weight) {
          changed = true;
          return {
            ...m,
            weight: match.weight,
          };
        }
        return m;
      });
      return changed ? updated : prev;
    });
  };

  // --- Active Week & Profile Calculations ---
  const activeWeekIndex = useMemo(() => {
    if (selectedWeekFilter === 'all') {
      return 0; // default to Week 1
    }
    return selectedWeekFilter - 1;
  }, [selectedWeekFilter]);

  const activeProfile = useMemo(() => {
    if (selectedWeekFilter === 'all') {
      const filledMeasurements = measurements.filter((m) => m.weight && m.weight > 0);
      if (filledMeasurements.length > 0) {
        return { ...profile, weight: filledMeasurements[filledMeasurements.length - 1].weight };
      }
      return profile;
    }
    const weekData = measurements.find((m) => m.week === selectedWeekFilter);
    if (weekData && weekData.weight && weekData.weight > 0) {
      return { ...profile, weight: weekData.weight };
    }
    const priorFilled = [...measurements]
      .filter((m) => m.week < selectedWeekFilter && m.weight && m.weight > 0)
      .sort((a, b) => b.week - a.week);
    if (priorFilled.length > 0) {
      return { ...profile, weight: priorFilled[0].weight };
    }
    return profile;
  }, [profile, selectedWeekFilter, measurements]);

  const activeDailyLog = useMemo(() => {
    const weekNum = selectedWeekFilter === 'all' ? 1 : selectedWeekFilter;
    return dailyLogs.find((log) => log.week === weekNum && log.day === selectedDay) || dailyLogs[0];
  }, [dailyLogs, selectedWeekFilter, selectedDay]);

  const activeWeekLogs = useMemo(() => {
    const weekNum = selectedWeekFilter === 'all' ? 1 : selectedWeekFilter;
    return dailyLogs.filter((log) => log.week === weekNum);
  }, [dailyLogs, selectedWeekFilter]);

  const handleDailyLogChange = (newLog: DailyLog) => {
    const weekNum = selectedWeekFilter === 'all' ? 1 : selectedWeekFilter;
    const updated = dailyLogs.map((log) => {
      if (log.week === weekNum && log.day === selectedDay) {
        return {
          ...newLog,
          week: weekNum,
          day: selectedDay,
        };
      }
      return log;
    });
    setDailyLogs(updated);
  };

  // --- Core metrics for global view header ---
  const globalSummary = useMemo(() => {
    const bmr = calculateBMR(activeProfile);
    const tdee = calculateTDEE(activeProfile, bmr);
    const targetCalories = activeProfile.isManualMacros && activeProfile.manualCalories
      ? activeProfile.manualCalories
      : Math.max(1200, tdee - activeProfile.weeklyDeficitTarget);
    return {
      tdee,
      targetCalories,
    };
  }, [activeProfile]);

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Header Banner */}
      <header id="main-header" className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt={profile.name || 'User'} 
                className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <Activity id="main-logo" className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{profile.name || "Dieta e Treino"}</h1>
              <p className="text-xs text-slate-400 font-medium">Diário de evolução científica • 16 semanas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold bg-slate-50 border border-slate-200/60 rounded-lg px-3.5 py-2">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Gasto Diário (TDEE)</span>
              <span className="text-slate-800 font-bold font-mono">{Math.round(globalSummary.tdee)} kcal</span>
            </div>
            <div className="h-5 w-[1px] bg-slate-200" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Meta Calórica</span>
              <span className="text-slate-900 font-bold font-mono">{Math.round(globalSummary.targetCalories)} kcal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sheets Sync Control Bar */}
      <SheetsSync
        user={user}
        syncStatus={syncStatus}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onCreateSpreadsheet={handleCreateSpreadsheet}
        onSyncNow={handleSyncNow}
      />

      {/* Navigation Subheader / Tabs */}
      <div id="tabs-navigation-bar" className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-4 scrollbar-none">
          <button
            id="tab-metas"
            onClick={() => setActiveTab('metas')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'metas'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Metabolismo & Metas
          </button>
          <button
            id="tab-dieta"
            onClick={() => setActiveTab('dieta')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dieta'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Plano Alimentar
          </button>
          <button
            id="tab-treinos"
            onClick={() => setActiveTab('treinos')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'treinos'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Treinos & Cardio
          </button>
          <button
            id="tab-medidas"
            onClick={() => setActiveTab('medidas')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'medidas'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            Peso & Medidas (16 Sem.)
          </button>
          <button
            id="tab-progresso"
            onClick={() => setActiveTab('progresso')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'progresso'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Progresso & Gráficos
          </button>
          <button
            id="tab-saude"
            onClick={() => setActiveTab('saude')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'saude'
                ? 'border-rose-600 text-rose-600 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-rose-500" />
            Saúde &amp; Condições
          </button>
          <button
            id="tab-conexoes"
            onClick={() => setActiveTab('conexoes')}
            className={`py-3.5 px-1 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'conexoes'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Nuvem &amp; Backup
          </button>
        </div>
      </div>

      {/* Global Week Filter Bar */}
      <div id="global-week-filter-bar" className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Cronograma de 16 Semanas</span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {selectedWeekFilter === 'all' 
                  ? 'Exibindo visão geral do plano. Selecione uma semana para ver e inserir dados individualmente.' 
                  : `Filtrado por: Semana ${selectedWeekFilter}.`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
            <button
              id="week-filter-all"
              onClick={() => setSelectedWeekFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedWeekFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Visão Geral
            </button>
            
            {Array.from({ length: 16 }).map((_, idx) => {
              const w = idx + 1;
              const hasWeight = measurements.find((m) => m.week === w)?.weight || 0;
              return (
                <button
                  key={w}
                  id={`week-filter-${w}`}
                  onClick={() => setSelectedWeekFilter(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    selectedWeekFilter === w
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  S{w}
                  {hasWeight > 0 && (
                    <span className={`w-1 h-1 rounded-full ${selectedWeekFilter === w ? 'bg-white' : 'bg-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Persistent Avatar Status Bar at top of Screen */}
        <div className="mb-6">
          <InteractiveAvatar 
            profile={profile} 
            onProfileChange={setProfile} 
            measurements={measurements} 
            compact={true} 
          />
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'metas' && (
            <MetricCalculator 
              profile={profile} 
              onProfileChange={setProfile} 
              selectedWeekFilter={selectedWeekFilter}
              measurements={measurements}
              onMeasurementsChange={setMeasurements}
              onStartDateChange={handleStartDateChange}
            />
          )}
          {activeTab === 'dieta' && (
            <MealPlanner
              profile={activeProfile}
              dailyLog={activeDailyLog}
              onDailyLogChange={handleDailyLogChange}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              activeWeekLogs={activeWeekLogs}
              workouts={workouts}
            />
          )}
          {activeTab === 'treinos' && (
            <WorkoutTracker
              profile={activeProfile}
              workouts={workouts}
              onWorkoutsChange={setWorkouts}
              selectedWeekFilter={selectedWeekFilter}
            />
          )}
          {activeTab === 'medidas' && (
            <MeasurementsTracker 
              measurements={measurements} 
              onMeasurementsChange={setMeasurements} 
              selectedWeekFilter={selectedWeekFilter}
              onWeekFilterChange={setSelectedWeekFilter}
              workouts={workouts}
              dailyLogs={dailyLogs}
            />
          )}
          {activeTab === 'progresso' && (
            <ProgressCharts 
              profile={profile} 
              onProfileChange={setProfile}
              measurements={measurements} 
              onMeasurementsChange={setMeasurements} 
              selectedWeekFilter={selectedWeekFilter}
              onWeekFilterChange={setSelectedWeekFilter}
              workouts={workouts}
              dailyLogs={dailyLogs}
            />
          )}
          {activeTab === 'saude' && (
            <div className="flex flex-col gap-6">
              <HealthQuestionnaire
                profile={profile}
                onProfileChange={setProfile}
              />
              <HealthNutritionalGuide
                profile={profile}
              />
            </div>
          )}
          {activeTab === 'conexoes' && (
            <ConnectionsManager 
              user={user}
              accessToken={accessToken}
              profile={profile}
              measurements={measurements}
              workouts={workouts}
              onSignIn={handleSignIn}
              onImportWorkouts={handleImportWorkouts}
              onImportWeights={handleImportWeights}
              onSaveCloudBackup={handleSaveCloudBackup}
              onRestoreCloudBackup={handleRestoreCloudBackup}
            />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p>Seu diário e guia inteligente de emagrecimento saudável e performance de 16 semanas.</p>
          <p className="mt-1">Todas as estimativas metabólicas e calóricas utilizam fórmulas médicas e esportivas embasadas e validadas.</p>
        </div>
      </footer>
    </div>
  );
}
