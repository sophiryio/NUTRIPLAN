/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, MeasurementLog, DailyLog, WorkoutEntry } from '../types';

interface SpreadsheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a beautifully structured Google Spreadsheet for Diet & Workout tracking.
 */
export const createDietSpreadsheet = async (
  accessToken: string,
  title: string = 'Plano de Dieta e Treino - 16 Semanas'
): Promise<SpreadsheetResponse> => {
  console.log('[Google Sheets API - createDietSpreadsheet] Enviando requisição POST para https://sheets.googleapis.com/v4/spreadsheets');
  console.log('[Google Sheets API - createDietSpreadsheet] Payload de criação:', { title, sheetsCount: 4 });
  
  try {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: title,
        },
        sheets: [
          { properties: { title: 'Metas e Biometria' } },
          { properties: { title: 'Acompanhamento Semanal' } },
          { properties: { title: 'Plano Alimentar Diário' } },
          { properties: { title: 'Registro de Treinos' } },
        ],
      }),
    });

    console.log(`[Google Sheets API - createDietSpreadsheet] Resposta HTTP recebida. Status: ${response.status} (${response.statusText})`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Google Sheets API - createDietSpreadsheet] Erro retornado pela API do Google:', errorData);
      console.error('[Google Sheets API - createDietSpreadsheet] Verifique os escopos concedidos. É necessário escopo de escrita (drive.file ou sheets).');
      throw new Error(errorData.error?.message || `Falha ao criar planilha no Google Sheets (Status ${response.status})`);
    }

    const data = await response.json();
    console.log('[Google Sheets API - createDietSpreadsheet] Planilha criada com sucesso! Dados retornados:', {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    });
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    };
  } catch (error) {
    console.error('[Google Sheets API - createDietSpreadsheet] Erro na chamada HTTP:', error);
    throw error;
  }
};

/**
 * Dynamically queries the structure of the spreadsheet to find the correct sheet IDs for each title.
 */
export const getSpreadsheetSheetIds = async (
  accessToken: string,
  spreadsheetId: string
): Promise<Record<string, number>> => {
  console.log(`[Google Sheets API - getSpreadsheetSheetIds] Obtendo IDs das abas para a planilha ID: ${spreadsheetId}`);
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`[Google Sheets API - getSpreadsheetSheetIds] Resposta HTTP recebida. Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Google Sheets API - getSpreadsheetSheetIds] Erro ao obter metadados da planilha:', errorData);
      throw new Error(errorData.error?.message || `Falha ao obter metadados da planilha no Google Sheets (Status ${response.status})`);
    }

    const data = await response.json();
    const map: Record<string, number> = {};
    if (data.sheets) {
      data.sheets.forEach((sheet: any) => {
        if (sheet.properties) {
          map[sheet.properties.title] = sheet.properties.sheetId;
        }
      });
    }
    console.log('[Google Sheets API - getSpreadsheetSheetIds] Mapeamento de abas carregado com sucesso:', map);
    return map;
  } catch (error) {
    console.error('[Google Sheets API - getSpreadsheetSheetIds] Erro de rede:', error);
    throw error;
  }
};

// Colors definition for professional Google Sheets design (values from 0.0 to 1.0)
const PALETTE = {
  indigoDark: { red: 30 / 255, green: 27 / 255, blue: 75 / 255 },    // #1e1b4b
  indigoAccent: { red: 79 / 255, green: 70 / 255, blue: 229 / 255 }, // #4f46e5
  indigoLight: { red: 238 / 255, green: 242 / 255, blue: 255 / 255 }, // #e0e7ff
  
  emeraldDark: { red: 6 / 255, green: 78 / 255, blue: 59 / 255 },     // #064e3b
  emeraldAccent: { red: 5 / 255, green: 150 / 255, blue: 105 / 255 }, // #059669
  emeraldLight: { red: 240 / 255, green: 253 / 255, blue: 244 / 255 }, // #f0fdf4
  
  slateDark: { red: 15 / 255, green: 23 / 255, blue: 42 / 255 },     // #0f172a
  slateAccent: { red: 71 / 255, green: 85 / 255, blue: 105 / 255 },  // #475569
  slateLight: { red: 248 / 255, green: 250 / 255, blue: 252 / 255 },  // #f8fafc
  
  violetDark: { red: 88 / 255, green: 28 / 255, blue: 135 / 255 },    // #581c87
  violetAccent: { red: 124 / 255, green: 58 / 255, blue: 237 / 255 }, // #7c3aed
  violetLight: { red: 245 / 255, green: 243 / 255, blue: 255 / 255 },  // #f5f3ff
  
  amberLight: { red: 254 / 255, green: 243 / 255, blue: 199 / 255 },  // #fef3c7
  white: { red: 1.0, green: 1.0, blue: 1.0 },
};

/**
 * Helper to build custom cell formatting requests for the batchUpdate API.
 */
const styleRange = (
  sheetId: number,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  style: {
    backgroundColor?: { red: number; green: number; blue: number };
    foregroundColor?: { red: number; green: number; blue: number };
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    horizontalAlignment?: 'LEFT' | 'CENTER' | 'RIGHT';
    borders?: boolean;
    numberFormat?: { type: string; pattern: string };
  }
) => {
  const cellFormat: any = {};
  
  if (style.backgroundColor) {
    cellFormat.backgroundColor = style.backgroundColor;
  }
  
  const textFormat: any = {};
  if (style.foregroundColor) textFormat.foregroundColor = style.foregroundColor;
  if (style.fontSize) textFormat.fontSize = style.fontSize;
  if (style.bold !== undefined) textFormat.bold = style.bold;
  if (style.italic !== undefined) textFormat.italic = style.italic;
  textFormat.fontFamily = 'Arial';
  cellFormat.textFormat = textFormat;

  if (style.horizontalAlignment) {
    cellFormat.horizontalAlignment = style.horizontalAlignment;
  }
  cellFormat.verticalAlignment = 'MIDDLE';

  if (style.borders) {
    const lightGray = { red: 0.85, green: 0.85, blue: 0.85 };
    const borderStyle = { style: 'SOLID', color: lightGray };
    cellFormat.borders = {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle
    };
  }

  if (style.numberFormat) {
    cellFormat.numberFormat = style.numberFormat;
  }

  const fieldsArr: string[] = [];
  if (style.backgroundColor) fieldsArr.push('backgroundColor');
  if (Object.keys(textFormat).length > 0) fieldsArr.push('textFormat');
  if (style.horizontalAlignment) fieldsArr.push('horizontalAlignment');
  fieldsArr.push('verticalAlignment');
  if (style.borders) fieldsArr.push('borders');
  if (style.numberFormat) fieldsArr.push('numberFormat');

  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: startCol,
        endColumnIndex: endCol,
      },
      cell: {
        userEnteredFormat: cellFormat,
      },
      fields: `userEnteredFormat(${fieldsArr.join(',')})`,
    }
  };
};

/**
 * Helper to merge cells.
 */
const mergeCellsRange = (sheetId: number, startRow: number, endRow: number, startCol: number, endCol: number) => ({
  mergeCells: {
    range: {
      sheetId,
      startRowIndex: startRow,
      endRowIndex: endRow,
      startColumnIndex: startCol,
      endColumnIndex: endCol,
    },
    mergeType: 'MERGE_ALL',
  }
});

/**
 * Helper to set custom column widths.
 */
const setColWidths = (sheetId: number, widths: number[]) => {
  return widths.map((width, idx) => ({
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: idx,
        endIndex: idx + 1,
      },
      properties: {
        pixelSize: width,
      },
      fields: 'pixelSize',
    }
  }));
};

/**
 * Translates activity level key to a beautiful string.
 */
const translateActivity = (level: string): string => {
  const map: Record<string, string> = {
    sedentary: 'Sedentário (Sem treino)',
    light: 'Leve (Treino 1-3 dias/sem)',
    moderate: 'Moderado (Treino 3-5 dias/sem)',
    active: 'Intenso (Treino diário)',
    extreme: 'Extremo (Trabalho/Atleta)',
  };
  return map[level] || level;
};

/**
 * Pushes all application data to Google Sheets to keep it in sync and format beautifully.
 */
export const syncDataToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  profile: UserProfile,
  tdee: number,
  bmr: number,
  targetCalories: number,
  targetMacros: { protein: number; carbs: number; fat: number },
  measurements: MeasurementLog[],
  dailyLogs: DailyLog[],
  workouts: WorkoutEntry[]
): Promise<void> => {
  // Discover actual sheet IDs of the sheets dynamically
  const sheetMap = await getSpreadsheetSheetIds(accessToken, spreadsheetId);
  const sheetId0 = sheetMap['Metas e Biometria'] ?? 0;
  const sheetId1 = sheetMap['Acompanhamento Semanal'] ?? 0;
  const sheetId2 = sheetMap['Plano Alimentar Diário'] ?? 0;
  const sheetId3 = sheetMap['Registro de Treinos'] ?? 0;

  // --------------------------------------------------
  // 1. Prepare TAB 1: "Metas e Biometria" Values
  // --------------------------------------------------
  const metasValues = [
    ['METAS E BIOMETRIA - PLANO DE 16 SEMANAS', '', '', '', '', '', '', '', ''],
    [],
    ['Perfil do Usuário', 'Valor', '', 'Cálculos Metabólicos (Estudo)', 'Valor (kcal)', '', 'Metas de Macronutrientes', 'Quantidade (g)', 'Calorias (kcal)'],
    ['Nome', profile.name, '', 'Taxa Metabólica Basal (TMB)', Math.round(bmr), '', 'Proteínas', Math.round(targetMacros.protein), Math.round(targetMacros.protein * 4)],
    ['Idade', profile.age, '', 'Gasto Calórico Total (TDEE)', Math.round(tdee), '', 'Carboidratos', Math.round(targetMacros.carbs), Math.round(targetMacros.carbs * 4)],
    ['Gênero', profile.gender === 'male' ? 'Masculino' : 'Feminino', '', 'Déficit Calórico Semanal', profile.weeklyDeficitTarget, '', 'Gorduras', Math.round(targetMacros.fat), Math.round(targetMacros.fat * 9)],
    ['Altura (cm)', profile.height, '', 'Meta de Calorias Diária', Math.round(targetCalories), '', 'Total Planejado', '', Math.round(targetCalories)],
    ['Peso Atual (kg)', profile.weight, '', '', '', '', '', '', ''],
    ['Peso Meta (kg)', profile.targetWeight, '', '', '', '', '', '', ''],
    ['Atividade Física', translateActivity(profile.activityLevel), '', '', '', '', '', '', ''],
    ['Fórmula de Cálculo', profile.formula === 'mifflin' ? 'Mifflin-St Jeor (1990)' : 'Harris-Benedict (1984)', '', '', '', '', '', '', ''],
  ];

  // --------------------------------------------------
  // 2. Prepare TAB 2: "Acompanhamento Semanal" Values
  // --------------------------------------------------
  const acompanhamentoHeaders = [
    ['ACOMPANHAMENTO DE MEDIDAS CORPORAIS - 16 SEMANAS', '', '', '', '', '', '', '', '', '', '', ''],
    [],
    ['Semana', 'Data', 'Peso (kg)', 'Evolução (kg)', 'Cintura (cm)', 'Quadril (cm)', 'Peitoral (cm)', 'Braço Esq (cm)', 'Braço Dir (cm)', 'Coxa Esq (cm)', 'Coxa Dir (cm)', 'Notas'],
  ];
  const acompanhamentoRows = measurements.map((m, idx) => {
    const rowNum = 4 + idx; // Data rows start at Row 4 (1-based index)
    const evolutionFormula = idx === 0 
      ? '0.0' 
      : `=IF(C${rowNum}>0, C$4-C${rowNum}, "")`;

    return [
      `Semana ${m.week}`,
      m.date,
      m.weight || '',
      evolutionFormula,
      m.waist || '',
      m.hip || '',
      m.chest || '',
      m.armLeft || '',
      m.armRight || '',
      m.thighLeft || '',
      m.thighRight || '',
      m.notes || '',
    ];
  });
  const acompanhamentoValues = [...acompanhamentoHeaders, ...acompanhamentoRows];

  // --------------------------------------------------
  // 3. Prepare TAB 3: "Plano Alimentar Diário" Values
  // --------------------------------------------------
  const alimentarHeaders = [
    ['PLANO ALIMENTAR DIÁRIO E CONSUMO DE MACROS', '', '', '', '', '', ''],
    [],
    ['Refeição / Alimento', 'Especificação', 'Quantidade', 'Calorias (kcal)', 'Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)'],
  ];
  
  const alimentarRows: any[] = [];
  const latestLog = dailyLogs[0];
  const mealTotalRows: number[] = []; // row indices of meal totals
  const mealStyleRequests: any[] = [];
  
  let currentAlimentarRow = 4; // Data rows start at Row 4 (1-based)

  if (latestLog && latestLog.meals) {
    latestLog.meals.forEach((meal) => {
      // Meal header title row
      alimentarRows.push([meal.name.toUpperCase(), '', '', '', '', '', '']);
      mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
        backgroundColor: PALETTE.indigoAccent,
        foregroundColor: PALETTE.white,
        bold: true,
        fontSize: 10,
        horizontalAlignment: 'LEFT'
      }));
      mealStyleRequests.push(mergeCellsRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7));
      
      const startFoodRow = currentAlimentarRow + 1; // 1-based index for SUM formula
      currentAlimentarRow++;

      if (meal.entries.length === 0) {
        alimentarRows.push(['', '(Nenhum alimento cadastrado)', '', 0, 0, 0, 0]);
        mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
          italic: true,
          foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 },
          borders: true,
          fontSize: 9
        }));
        currentAlimentarRow++;
      } else {
        meal.entries.forEach((entry) => {
          const qtyStr = `${entry.amount}${entry.foodId.startsWith('custom') ? '' : 'g'}`;
          alimentarRows.push([
            '',
            entry.name,
            qtyStr,
            entry.calories,
            entry.protein,
            entry.carbs,
            entry.fat,
          ]);
          mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
            borders: true,
            fontSize: 9
          }));
          currentAlimentarRow++;
        });
      }
      
      const endFoodRow = currentAlimentarRow - 1; // 1-based index

      // Meal total row
      alimentarRows.push([
        `Total ${meal.name}`,
        '',
        '',
        `=SUM(D${startFoodRow}:D${endFoodRow})`,
        `=SUM(E${startFoodRow}:E${endFoodRow})`,
        `=SUM(F${startFoodRow}:F${endFoodRow})`,
        `=SUM(G${startFoodRow}:G${endFoodRow})`,
      ]);
      
      mealTotalRows.push(currentAlimentarRow); // Save 1-based index of this meal's total row
      
      mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
        backgroundColor: PALETTE.slateLight,
        bold: true,
        borders: true,
        fontSize: 9
      }));
      currentAlimentarRow++;

      // Spacer row
      alimentarRows.push([]);
      currentAlimentarRow++;
    });

    // Daily Grand Totals and Recommendations
    const totalConsumidoRow = currentAlimentarRow; // 1-based
    const totalCalSum = mealTotalRows.map(r => `D${r}`).join('+');
    const totalProtSum = mealTotalRows.map(r => `E${r}`).join('+');
    const totalCarbSum = mealTotalRows.map(r => `F${r}`).join('+');
    const totalFatSum = mealTotalRows.map(r => `G${r}`).join('+');

    alimentarRows.push([
      'TOTAL DIÁRIO CONSUMIDO',
      '',
      '',
      `=${totalCalSum}`,
      `=${totalProtSum}`,
      `=${totalCarbSum}`,
      `=${totalFatSum}`,
    ]);
    mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
      backgroundColor: PALETTE.amberLight,
      bold: true,
      borders: true,
      fontSize: 10
    }));
    currentAlimentarRow++;

    const metaRow = currentAlimentarRow; // 1-based
    alimentarRows.push([
      'META DIÁRIA RECOMENDADA',
      '',
      '',
      Math.round(targetCalories),
      Math.round(targetMacros.protein),
      Math.round(targetMacros.carbs),
      Math.round(targetMacros.fat),
    ]);
    mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
      backgroundColor: PALETTE.indigoLight,
      bold: true,
      borders: true,
      fontSize: 10
    }));
    currentAlimentarRow++;

    alimentarRows.push([
      'SALDO / DÉFICIT DIÁRIO',
      '',
      '',
      `=D${totalConsumidoRow}-D${metaRow}`,
      `=E${totalConsumidoRow}-E${metaRow}`,
      `=F${totalConsumidoRow}-F${metaRow}`,
      `=G${totalConsumidoRow}-G${metaRow}`,
    ]);
    mealStyleRequests.push(styleRange(sheetId2, currentAlimentarRow - 1, currentAlimentarRow, 0, 7, {
      backgroundColor: { red: 254 / 255, green: 226 / 255, blue: 226 / 255 }, // light red background
      bold: true,
      borders: true,
      fontSize: 10
    }));
    currentAlimentarRow++;
  } else {
    alimentarRows.push(['Sem refeições cadastradas no momento.', '', '', '', '', '', '']);
    currentAlimentarRow++;
  }

  const alimentarValues = [...alimentarHeaders, ...alimentarRows];

  // --------------------------------------------------
  // 4. Prepare TAB 4: "Registro de Treinos" Values
  // --------------------------------------------------
  const treinosHeaders = [
    ['HISTÓRICO E GASTO CALÓRICO DE TREINOS', '', '', '', '', ''],
    [],
    ['Data', 'Tipo de Atividade', 'Notas da Musculação', 'Cardio Realizado', 'Duração', 'Calorias Queimadas'],
  ];
  const treinosRows = workouts.map((w) => [
    w.date,
    w.type === 'strength' ? 'Musculação' : w.type === 'cardio' ? 'Cardio' : 'Musculação + Cardio',
    w.strengthNotes || 'N/A',
    w.cardioType || 'N/A',
    w.duration,
    w.caloriesBurned,
  ]);

  const workoutTotalRowIdx = 4 + treinosRows.length; // 1-based, where the SUM row will sit
  const totalDurationFormula = treinosRows.length > 0 ? `=SUM(E4:E${workoutTotalRowIdx - 1})` : 0;
  const totalBurnedFormula = treinosRows.length > 0 ? `=SUM(F4:F${workoutTotalRowIdx - 1})` : 0;

  const treinosValues = [
    ...treinosHeaders,
    ...treinosRows,
    ['TOTAL GASTO ATIVO REGISTRADO', '', '', '', totalDurationFormula, totalBurnedFormula],
  ];

  // --------------------------------------------------
  // 5. POST Data values to Google Sheets
  // --------------------------------------------------
  const valuesBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'Metas e Biometria'!A1:I20",
        values: metasValues,
      },
      {
        range: "'Acompanhamento Semanal'!A1:L35",
        values: acompanhamentoValues,
      },
      {
        range: "'Plano Alimentar Diário'!A1:G150",
        values: alimentarValues,
      },
      {
        range: "'Registro de Treinos'!A1:F100",
        values: treinosValues,
      },
    ],
  };

  console.log(`[Google Sheets API - syncDataToSpreadsheet] Enviando dados estruturados para a planilha ${spreadsheetId}...`);
  console.log('[Google Sheets API - syncDataToSpreadsheet] Conteúdo do BatchUpdate (Contagem de Ranges):', valuesBody.data.map(d => d.range));

  try {
    const valuesResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuesBody),
      }
    );

    console.log(`[Google Sheets API - syncDataToSpreadsheet] Resposta de gravação de valores recebida. Status: ${valuesResponse.status}`);

    if (!valuesResponse.ok) {
      const errorData = await valuesResponse.json().catch(() => ({}));
      console.error('[Google Sheets API - syncDataToSpreadsheet] Erro ao gravar valores na planilha:', errorData);
      throw new Error(errorData.error?.message || `Falha ao preencher dados na planilha do Google Sheets (Status ${valuesResponse.status})`);
    }
    console.log('[Google Sheets API - syncDataToSpreadsheet] Valores gravados com sucesso!');
  } catch (error) {
    console.error('[Google Sheets API - syncDataToSpreadsheet] Erro na gravação dos valores:', error);
    throw error;
  }

  // --------------------------------------------------
  // 6. Build Rich Visual Styling and Sizing Requests
  // --------------------------------------------------
  const formattingRequests: any[] = [];

  // COLUMN WIDTHS
  formattingRequests.push(...setColWidths(sheetId0, [170, 110, 40, 220, 120, 40, 180, 120, 120]));
  formattingRequests.push(...setColWidths(sheetId1, [110, 110, 100, 110, 95, 95, 95, 95, 95, 95, 95, 240]));
  formattingRequests.push(...setColWidths(sheetId2, [180, 220, 110, 130, 130, 130, 130]));
  formattingRequests.push(...setColWidths(sheetId3, [110, 150, 220, 220, 110, 150]));

  // FROZEN ROWS FOR BETTER SCROLLING
  formattingRequests.push({
    updateSheetProperties: {
      properties: { sheetId: sheetId1, gridProperties: { frozenRowCount: 3 } },
      fields: 'gridProperties.frozenRowCount',
    }
  }, {
    updateSheetProperties: {
      properties: { sheetId: sheetId2, gridProperties: { frozenRowCount: 3 } },
      fields: 'gridProperties.frozenRowCount',
    }
  }, {
    updateSheetProperties: {
      properties: { sheetId: sheetId3, gridProperties: { frozenRowCount: 3 } },
      fields: 'gridProperties.frozenRowCount',
    }
  });

  // MERGE TITLES
  formattingRequests.push(
    mergeCellsRange(sheetId0, 0, 1, 0, 9), // Tab 1 title
    mergeCellsRange(sheetId0, 2, 3, 0, 2), // Tab 1 Subheaders
    mergeCellsRange(sheetId0, 2, 3, 3, 5),
    mergeCellsRange(sheetId0, 2, 3, 6, 9),
    mergeCellsRange(sheetId1, 0, 1, 0, 12), // Tab 2 title
    mergeCellsRange(sheetId2, 0, 1, 0, 7),  // Tab 3 title
    mergeCellsRange(sheetId3, 0, 1, 0, 6)   // Tab 4 title
  );

  // --------------------------------------------------
  // TAB 1: METAS E BIOMETRIA FORMATS
  // --------------------------------------------------
  formattingRequests.push(
    // Title
    styleRange(sheetId0, 0, 1, 0, 9, { backgroundColor: PALETTE.indigoDark, foregroundColor: PALETTE.white, fontSize: 13, bold: true, horizontalAlignment: 'CENTER' }),
    // Subheaders
    styleRange(sheetId0, 2, 3, 0, 2, { backgroundColor: PALETTE.indigoAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    styleRange(sheetId0, 2, 3, 3, 5, { backgroundColor: PALETTE.indigoAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    styleRange(sheetId0, 2, 3, 6, 9, { backgroundColor: PALETTE.indigoAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    
    // Data Borders
    styleRange(sheetId0, 3, 11, 0, 2, { borders: true, fontSize: 9 }),
    styleRange(sheetId0, 3, 7, 3, 5, { borders: true, fontSize: 9 }),
    styleRange(sheetId0, 3, 7, 6, 9, { borders: true, fontSize: 9 }),
    
    // Left Alignments
    styleRange(sheetId0, 3, 11, 0, 1, { horizontalAlignment: 'LEFT' }),
    styleRange(sheetId0, 3, 7, 3, 4, { horizontalAlignment: 'LEFT' }),
    styleRange(sheetId0, 3, 7, 6, 7, { horizontalAlignment: 'LEFT' }),
    
    // Number Formats
    // Weight
    styleRange(sheetId0, 7, 9, 1, 2, { numberFormat: { type: 'NUMBER', pattern: '0.0 "kg"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Height
    styleRange(sheetId0, 6, 7, 1, 2, { numberFormat: { type: 'NUMBER', pattern: '0.0 "cm"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Age
    styleRange(sheetId0, 4, 5, 1, 2, { horizontalAlignment: 'RIGHT', borders: true }),
    // Metabolic Calories
    styleRange(sheetId0, 3, 7, 4, 5, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "kcal"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Macros grams
    styleRange(sheetId0, 3, 6, 7, 8, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "g"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Macros kcal
    styleRange(sheetId0, 3, 7, 8, 9, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "kcal"' }, horizontalAlignment: 'RIGHT', borders: true })
  );

  // --------------------------------------------------
  // TAB 2: ACOMPANHAMENTO SEMANAL FORMATS
  // --------------------------------------------------
  formattingRequests.push(
    // Title
    styleRange(sheetId1, 0, 1, 0, 12, { backgroundColor: PALETTE.emeraldDark, foregroundColor: PALETTE.white, fontSize: 13, bold: true, horizontalAlignment: 'CENTER' }),
    // Table Headers
    styleRange(sheetId1, 2, 3, 0, 12, { backgroundColor: PALETTE.emeraldAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    // Alignments
    styleRange(sheetId1, 3, 20, 0, 2, { horizontalAlignment: 'CENTER', borders: true }),
    styleRange(sheetId1, 3, 20, 11, 12, { horizontalAlignment: 'LEFT', borders: true }),
    // Weights
    styleRange(sheetId1, 3, 20, 2, 4, { numberFormat: { type: 'NUMBER', pattern: '0.0 "kg"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Circumferences
    styleRange(sheetId1, 3, 20, 4, 11, { numberFormat: { type: 'NUMBER', pattern: '0.0 "cm"' }, horizontalAlignment: 'RIGHT', borders: true })
  );

  // Zebra striping for Tab 2
  for (let idx = 0; idx < measurements.length; idx++) {
    const rowIdx = 3 + idx;
    const isEven = idx % 2 === 0;
    const rowColor = isEven ? PALETTE.emeraldLight : PALETTE.white;
    formattingRequests.push(styleRange(sheetId1, rowIdx, rowIdx + 1, 0, 12, {
      backgroundColor: rowColor,
      borders: true,
      fontSize: 9,
    }));
  }

  // --------------------------------------------------
  // TAB 3: PLANO ALIMENTAR FORMATS
  // --------------------------------------------------
  formattingRequests.push(
    // Title banner
    styleRange(sheetId2, 0, 1, 0, 7, { backgroundColor: PALETTE.slateDark, foregroundColor: PALETTE.white, fontSize: 13, bold: true, horizontalAlignment: 'CENTER' }),
    // Table Header
    styleRange(sheetId2, 2, 3, 0, 7, { backgroundColor: PALETTE.slateAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    // Number formats on dietary quantities & macronutrients
    styleRange(sheetId2, 3, currentAlimentarRow, 3, 4, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "kcal"' }, horizontalAlignment: 'RIGHT', borders: true }),
    styleRange(sheetId2, 3, currentAlimentarRow, 4, 7, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "g"' }, horizontalAlignment: 'RIGHT', borders: true }),
    styleRange(sheetId2, 3, currentAlimentarRow, 2, 3, { horizontalAlignment: 'CENTER', borders: true }),
    // Inject the inline meal header / layout requests created above
    ...mealStyleRequests
  );

  // --------------------------------------------------
  // TAB 4: REGISTRO DE TREINOS FORMATS
  // --------------------------------------------------
  formattingRequests.push(
    // Title
    styleRange(sheetId3, 0, 1, 0, 6, { backgroundColor: PALETTE.violetDark, foregroundColor: PALETTE.white, fontSize: 13, bold: true, horizontalAlignment: 'CENTER' }),
    // Headers
    styleRange(sheetId3, 2, 3, 0, 6, { backgroundColor: PALETTE.violetAccent, foregroundColor: PALETTE.white, fontSize: 10, bold: true, horizontalAlignment: 'CENTER' }),
    // Alignment and numbers
    styleRange(sheetId3, 3, workoutTotalRowIdx, 0, 2, { horizontalAlignment: 'CENTER', borders: true }),
    styleRange(sheetId3, 3, workoutTotalRowIdx, 2, 4, { horizontalAlignment: 'LEFT', borders: true }),
    styleRange(sheetId3, 3, workoutTotalRowIdx + 1, 4, 5, { numberFormat: { type: 'NUMBER', pattern: '0 "min"' }, horizontalAlignment: 'RIGHT', borders: true }),
    styleRange(sheetId3, 3, workoutTotalRowIdx + 1, 5, 6, { numberFormat: { type: 'NUMBER', pattern: '#,##0 "kcal"' }, horizontalAlignment: 'RIGHT', borders: true }),
    // Grand totals background
    styleRange(sheetId3, workoutTotalRowIdx, workoutTotalRowIdx + 1, 0, 6, { backgroundColor: PALETTE.amberLight, bold: true, borders: true, fontSize: 10 })
  );

  // Alternate rows for workouts
  for (let idx = 0; idx < workouts.length; idx++) {
    const rowIdx = 3 + idx;
    const isEven = idx % 2 === 0;
    const rowColor = isEven ? PALETTE.violetLight : PALETTE.white;
    formattingRequests.push(styleRange(sheetId3, rowIdx, rowIdx + 1, 0, 6, {
      backgroundColor: rowColor,
      borders: true,
      fontSize: 9,
    }));
  }

  // --------------------------------------------------
  // 7. Push formatting to Google Sheets batchUpdate
  // --------------------------------------------------
  const formatBody = {
    requests: formattingRequests,
  };

  console.log(`[Google Sheets API - syncDataToSpreadsheet] Enviando solicitações de formatação e design (${formattingRequests.length} solicitações) para a planilha...`);
  
  try {
    const formatResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formatBody),
      }
    );

    console.log(`[Google Sheets API - syncDataToSpreadsheet] Resposta de formatação recebida. Status: ${formatResponse.status}`);

    if (!formatResponse.ok) {
      const formatError = await formatResponse.json().catch(() => ({}));
      console.error('[Google Sheets API - syncDataToSpreadsheet] Detalhes do erro de formatação/estilização:', formatError);
      // Do not fail the whole sync process if formatting fails, but report it.
      throw new Error(formatError.error?.message || 'Falha ao estilizar visualmente a planilha no Google Sheets.');
    }
    console.log('[Google Sheets API - syncDataToSpreadsheet] Formatação e design aplicados com sucesso!');
  } catch (error) {
    console.error('[Google Sheets API - syncDataToSpreadsheet] Erro na requisição de formatação:', error);
    throw error;
  }
};
