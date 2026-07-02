import { jsPDF } from 'jspdf';
import { UserProfile, DailyLog, WorkoutEntry, MeasurementLog } from '../types';
import { calculateBMR, calculateTDEE, calculateTargetMacros } from '../data/defaults';

// Helper to format date
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export const generateWeeklyReportPDF = (
  profile: UserProfile,
  week: number,
  weekLogs: DailyLog[],
  weekWorkouts: WorkoutEntry[],
  currentMeasurement: MeasurementLog | null,
  priorMeasurement: MeasurementLog | null
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette
  const colors = {
    primary: [15, 23, 42],       // #0f172a Slate 900
    primaryLight: [30, 41, 59],  // #1e293b Slate 800
    secondary: [59, 130, 246],   // #3b82f6 Blue 500
    success: [16, 185, 129],     // #10b981 Emerald 500
    accent: [249, 115, 22],      // #f97316 Orange 500
    bgLight: [248, 250, 252],    // #f8fafc Slate 50
    textDark: [51, 65, 85],      // #334155 Slate 700
    textMuted: [148, 163, 184],  // #94a698 Slate 400
    border: [226, 232, 240],     // #e2e8f0 Slate 200
  };

  // Helper to draw structured cards with rounded borders
  const drawCard = (x: number, y: number, w: number, h: number, title?: string) => {
    // Light background
    doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    if (title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
      doc.text(title, x + 4, y + 6);
      
      // Card divider line
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.line(x, y + 9, x + w, y + 9);
    }
  };

  // HEADER BAND
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Title Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('REMIXNUTRIPLAN 16', 15, 16);

  // Subtitle / Label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253); // Light sky blue
  doc.text('PROGRAMA DE RECOMPOSIÇÃO CORPORAL', 15, 22);

  // Week Indicator Badge
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.roundedRect(155, 10, 40, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`SEMANA ${week}`, 164, 16.5);

  // Period / Date Range
  const firstLogDate = weekLogs.length > 0 ? formatDate(weekLogs[0].date) : '';
  const lastLogDate = weekLogs.length > 0 ? formatDate(weekLogs[weekLogs.length - 1].date) : '';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(firstLogDate && lastLogDate ? `Período: ${firstLogDate} a ${lastLogDate}` : 'Relatório Semanal Ativo', 155, 25);

  // 1. DADOS DO USUÁRIO & ALVO (Y: 42 to 70)
  const userY = 43;
  drawCard(15, userY, 180, 24);

  // User Info columns
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  doc.text('ALUNO(A):', 20, userY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.name || 'Não Informado', 40, userY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('IDADE:', 115, userY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.age || '--'} anos`, 130, userY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('ALTURA:', 155, userY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.height || '--'} cm`, 172, userY + 7);

  // Row 2 of User Info
  doc.setFont('helvetica', 'bold');
  doc.text('PESO INICIAL:', 20, userY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.weight || '--'} kg`, 46, userY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('PESO META:', 115, userY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.targetWeight || '--'} kg`, 138, userY + 14);

  // Calculate target numbers for display
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile, bmr);
  const targetCalories = profile.isManualMacros && profile.manualCalories ? profile.manualCalories : Math.max(1200, tdee - profile.weeklyDeficitTarget);
  const targetMacros = calculateTargetMacros(profile, targetCalories);

  doc.setFont('helvetica', 'bold');
  doc.text('META DIÁRIA:', 20, userY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${targetCalories.toLocaleString('pt-BR')} kcal  |  P: ${Math.round(targetMacros.protein)}g  |  C: ${Math.round(targetMacros.carbs)}g  |  G: ${Math.round(targetMacros.fat)}g`, 46, userY + 20);

  // 2. RESUMO DE MÉTRICAS DA SEMANA (Y: 71 to 105)
  const summaryY = 72;
  
  // Weights comparison card
  drawCard(15, summaryY, 56, 30, 'CONTROLE DE PESO');
  const currentW = currentMeasurement ? currentMeasurement.weight : null;
  const priorW = priorMeasurement ? priorMeasurement.weight : profile.weight;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Semana Anterior:', 19, summaryY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(priorW ? `${priorW.toFixed(1)} kg` : '--', 46, summaryY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('Peso Atual:', 19, summaryY + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(currentW ? `${currentW.toFixed(1)} kg` : '--', 46, summaryY + 21);

  if (currentW && priorW) {
    const diff = currentW - priorW;
    const isLoss = diff < 0;
    doc.setFillColor(isLoss ? colors.success[0] : colors.accent[0], isLoss ? colors.success[1] : colors.accent[1], isLoss ? colors.success[2] : colors.accent[2]);
    doc.roundedRect(19, summaryY + 24, 48, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(diff === 0 ? 'Sem alteração' : `${isLoss ? 'Perda' : 'Ganho'} de ${Math.abs(diff).toFixed(1)} kg na semana`, 21, summaryY + 27.5);
  }

  // Workouts Summary Card
  drawCard(76, summaryY, 58, 30, 'TREINOS REALIZADOS');
  const strengthCount = weekWorkouts.filter(w => w.type === 'strength' || w.type === 'both').length;
  const cardioCount = weekWorkouts.filter(w => w.type === 'cardio' || w.type === 'both').length;
  const totalBurn = weekWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Musculação:', 80, summaryY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${strengthCount} sessões`, 108, summaryY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('Cardio / Aeróbico:', 80, summaryY + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cardioCount} sessões`, 108, summaryY + 21);

  doc.setFont('helvetica', 'normal');
  doc.text('Gasto Energético:', 80, summaryY + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(`+ ${totalBurn} kcal`, 108, summaryY + 27);

  // Diet Adherence Summary Card
  drawCard(139, summaryY, 56, 30, 'ADESÃO ALIMENTAR');
  
  // Calculate meal compliance and water intake
  let totalMeals = 0;
  let adheredMeals = 0;
  let totalWater = 0;
  let daysWithWater = 0;

  weekLogs.forEach(log => {
    log.meals.forEach(m => {
      totalMeals++;
      if (m.adhered) adheredMeals++;
    });
    if (log.waterIntake > 0) {
      totalWater += log.waterIntake;
      daysWithWater++;
    }
  });

  const adherenceRate = totalMeals > 0 ? (adheredMeals / totalMeals) * 100 : 0;
  const avgWater = daysWithWater > 0 ? totalWater / daysWithWater : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Refeições Feitas:', 143, summaryY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${adheredMeals} de ${totalMeals}`, 173, summaryY + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('Taxa de Adesão:', 143, summaryY + 21);
  doc.setFont('helvetica', 'bold');
  if (adherenceRate >= 80) {
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
  } else {
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  }
  doc.text(`${Math.round(adherenceRate)}%`, 173, summaryY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Média de Água/dia:', 143, summaryY + 27);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(avgWater / 1000).toFixed(1)} L`, 173, summaryY + 27);

  // 3. DIÁRIO DETALHADO DA ALIMENTAÇÃO (Y: 106 to 160)
  const tableY = 107;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('DETALHAMENTO DIÁRIO DE CONSUMO', 15, tableY + 4);

  // Table Headers
  doc.setFillColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.rect(15, tableY + 7, 180, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  
  doc.text('Dia', 18, tableY + 11.5);
  doc.text('Data', 32, tableY + 11.5);
  doc.text('Calorias (kcal)', 55, tableY + 11.5);
  doc.text('Proteínas (g)', 85, tableY + 11.5);
  doc.text('Carboidratos (g)', 115, tableY + 11.5);
  doc.text('Gorduras (g)', 148, tableY + 11.5);
  doc.text('Adesão Refeições', 174, tableY + 11.5);

  // Draw logs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  // Initialize standard full week array to show all 7 days elegantly even if missing
  const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  
  for (let d = 1; d <= 7; d++) {
    const rowY = tableY + 13 + (d - 1) * 6;
    
    // Zebra striping
    if (d % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, rowY - 4, 180, 6, 'F');
    }
    
    // Row separator
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.15);
    doc.line(15, rowY + 2, 195, rowY + 2);

    const log = weekLogs.find(l => l.day === d);
    doc.setTextColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dia ${d}`, 18, rowY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(log ? formatDate(log.date).substring(0, 5) : daysOfWeek[d - 1].substring(0, 3), 32, rowY);

    if (log) {
      // Calculate totals for this day
      let dayCal = 0;
      let dayProt = 0;
      let dayCarb = 0;
      let dayFat = 0;
      let logMealsCount = 0;
      let logAdheredCount = 0;

      log.meals.forEach(m => {
        logMealsCount++;
        if (m.adhered) logAdheredCount++;
        m.entries.forEach(e => {
          dayCal += e.calories;
          dayProt += e.protein;
          dayCarb += e.carbs;
          dayFat += e.fat;
        });
      });

      // Calorie highlight
      doc.setFont('helvetica', 'bold');
      doc.text(`${Math.round(dayCal)}`, 55, rowY);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${dayProt.toFixed(1)}g`, 85, rowY);
      doc.text(`${dayCarb.toFixed(1)}g`, 115, rowY);
      doc.text(`${dayFat.toFixed(1)}g`, 148, rowY);
      
      // Adherence percent
      const dayAdherence = logMealsCount > 0 ? (logAdheredCount / logMealsCount) * 100 : 0;
      doc.setFont('helvetica', 'bold');
      if (dayAdherence >= 80) {
        doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
      } else if (dayAdherence > 0) {
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      } else {
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      }
      doc.text(`${logAdheredCount}/${logMealsCount} (${Math.round(dayAdherence)}%)`, 174, rowY);
    } else {
      // Empty day
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text('S/ Registro', 55, rowY);
      doc.text('--', 85, rowY);
      doc.text('--', 115, rowY);
      doc.text('--', 148, rowY);
      doc.text('0%', 174, rowY);
    }
  }

  // 4. HISTÓRICO DE EXERCÍCIOS DA SEMANA (Y: 165 to 220)
  const workoutsY = 162;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('HISTÓRICO DE TREINAMENTO DA SEMANA', 15, workoutsY + 4);

  // Table Headers for Workouts
  doc.setFillColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.rect(15, workoutsY + 7, 180, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Data', 18, workoutsY + 11.5);
  doc.text('Tipo de Treino', 40, workoutsY + 11.5);
  doc.text('Foco / Notas de Musculação', 75, workoutsY + 11.5);
  doc.text('Tempo', 155, workoutsY + 11.5);
  doc.text('Gasto (kcal)', 175, workoutsY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  if (weekWorkouts.length === 0) {
    // Show beautiful empty workout row
    doc.setFillColor(248, 250, 252);
    doc.rect(15, workoutsY + 13, 180, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text('Nenhum treino de musculação ou cardio registrado para esta semana.', 55, workoutsY + 19.5);
    
    // Draw boundary line
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.15);
    doc.line(15, workoutsY + 23, 195, workoutsY + 23);
  } else {
    // Render up to 5 workouts nicely on this page (if more, they are aggregated or cut to prevent page overflows)
    const workoutsToRender = weekWorkouts.slice(0, 5);
    workoutsToRender.forEach((w, idx) => {
      const rowY = workoutsY + 13 + idx * 6.5;
      
      // Zebra striping
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, rowY - 4.5, 180, 6.5, 'F');
      }

      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.15);
      doc.line(15, rowY + 2, 195, rowY + 2);

      doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(w.date), 18, rowY);
      
      // Workout Type Translation
      const typeStr = w.type === 'strength' ? 'Musculação' : w.type === 'cardio' ? 'Cardio' : 'Musc + Cardio';
      doc.setFont('helvetica', 'bold');
      doc.text(typeStr, 40, rowY);

      doc.setFont('helvetica', 'normal');
      const focusText = w.type === 'cardio' ? `Cardio: ${w.cardioType || 'Geral'}` : w.strengthNotes || 'Sessão de Força';
      // Truncate note if too long
      const truncatedFocus = focusText.length > 45 ? focusText.substring(0, 42) + '...' : focusText;
      doc.text(truncatedFocus, 75, rowY);

      doc.text(`${w.duration} min`, 155, rowY);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(`${w.caloriesBurned} kcal`, 175, rowY);
    });

    if (weekWorkouts.length > 5) {
      const extraCount = weekWorkouts.length - 5;
      const extraY = workoutsY + 13 + 5 * 6.5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text(`+ ${extraCount} treinos registrados não listados por motivos de espaço no relatório.`, 18, extraY);
    }
  }

  // 5. MEDIDAS CORPORAIS & EVOLUÇÃO (Y: 215 to 265)
  const measuresY = 212;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('MEDIDAS E ANATOMIA CORPORAL', 15, measuresY + 4);

  // Measurements card layout
  drawCard(15, measuresY + 7, 180, 22);

  if (currentMeasurement) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
    
    // Grid alignment for standard metrics
    doc.text('Cintura:', 20, measuresY + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMeasurement.waist ? `${currentMeasurement.waist} cm` : '--'}`, 33, measuresY + 13);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Quadril:', 53, measuresY + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMeasurement.hip ? `${currentMeasurement.hip} cm` : '--'}`, 65, measuresY + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('Peitoral:', 85, measuresY + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMeasurement.chest ? `${currentMeasurement.chest} cm` : '--'}`, 98, measuresY + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('Braço Esq / Dir:', 118, measuresY + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMeasurement.armLeft || '--'} / ${currentMeasurement.armRight || '--'} cm`, 142, measuresY + 13);

    doc.setFont('helvetica', 'bold');
    doc.text('Coxa Esq / Dir:', 20, measuresY + 21);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentMeasurement.thighLeft || '--'} / ${currentMeasurement.thighRight || '--'} cm`, 43, measuresY + 21);

    if (currentMeasurement.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 85, measuresY + 21);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      const notesTrunc = currentMeasurement.notes.length > 55 ? currentMeasurement.notes.substring(0, 52) + '...' : currentMeasurement.notes;
      doc.text(`"${notesTrunc}"`, 105, measuresY + 21);
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text('Nenhuma medida registrada para esta semana. Adicione no painel de medidas para um acompanhamento visual completo.', 20, measuresY + 18);
  }

  // 6. SCIENTIFIC FEEDBACK & RECOMMENDATIONS (Y: 242 to 280)
  const feedbackY = 243;
  drawCard(15, feedbackY, 180, 28, 'DIRETRIZ CIENTÍFICA & FEEDBACK DO COACH');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  // Dynamic feedback logic based on adherence and stats
  let feedbackLine1 = 'Mantenha a consistência no plano alimentar. O segredo da recomposição corporal está no déficit calórico controlado.';
  let feedbackLine2 = 'Certifique-se de registrar seus treinos com precisão. A progressão de carga na musculação preserva a massa magra.';
  let feedbackLine3 = 'A hidratação diária de água apoia a lipólise (queima de gordura) e reduz a retenção de líquidos.';

  if (adherenceRate >= 85) {
    feedbackLine1 = '🔥 Excelente aderência alimentar! Manter-se acima de 85% garante resultados previsíveis e rápidos.';
  } else if (adherenceRate > 0 && adherenceRate < 70) {
    feedbackLine1 = '⚠️ Aderência alimentar abaixo do ideal. Tente planejar as refeições no dia anterior para evitar escolhas impulsivas.';
  }

  if (strengthCount >= 3) {
    feedbackLine2 = '💪 Excelente frequência de musculação! O estímulo de força é vital para sinalização hipertrófica.';
  }

  if (avgWater >= 2800) {
    feedbackLine3 = '💧 Consumo de água espetacular. Hidratação excelente é crucial para a função metabólica ideal.';
  } else if (avgWater > 0 && avgWater < 2000) {
    feedbackLine3 = '💧 Alerta de hidratação: Tente aumentar o consumo diário de água para pelo menos 35ml por kg corporal.';
  }

  doc.text(feedbackLine1, 19, feedbackY + 14);
  doc.text(feedbackLine2, 19, feedbackY + 19);
  doc.text(feedbackLine3, 19, feedbackY + 24);

  // FOOTER (Y: 282 to 297)
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.3);
  doc.line(15, 281, 195, 281);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('RemixNutriPlan 16 — Plataforma de Evolução Física Individualizada', 15, 287);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 155, 287);

  // Download PDF
  doc.save(`Relatorio_Semanal_RemixNutriPlan_Semana_${week}.pdf`);
};
