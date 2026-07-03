/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthConditions } from '../types';

export interface ConditionInfo {
  id: keyof HealthConditions;
  title: string;
  category: 'metabolic' | 'cardiovascular' | 'hormonal' | 'gastro' | 'special';
  shortDesc: string;
  question: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
}

export const HEALTH_CONDITIONS_LIST: ConditionInfo[] = [
  {
    id: 'diabetes',
    title: 'Diabetes (Tipo 1, Tipo 2 ou Pré-diabetes)',
    category: 'metabolic',
    shortDesc: 'Controle de glicemia e carga glicêmica das refeições',
    question: 'Você possui diagnóstico de Diabetes (Tipo 1, 2) ou Pré-diabetes?',
    iconName: 'Activity',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-800',
  },
  {
    id: 'insulinResistance',
    title: 'Resistência à Insulina',
    category: 'metabolic',
    shortDesc: 'Aumento da sensibilidade insulínica e prevenção de picos glicêmicos',
    question: 'Possui exames de insulina de jejum ou HOMA-IR alterados / Resistência à Insulina?',
    iconName: 'Zap',
    badgeBg: 'bg-orange-100 border-orange-300',
    badgeText: 'text-orange-800',
  },
  {
    id: 'sop',
    title: 'SOP (Síndrome dos Ovários Policísticos)',
    category: 'hormonal',
    shortDesc: 'Dieta anti-inflamatória e regulação hormonal e glicêmica',
    question: 'Possui diagnóstico de Síndrome dos Ovários Policísticos (SOP)?',
    iconName: 'Heart',
    badgeBg: 'bg-purple-100 border-purple-300',
    badgeText: 'text-purple-800',
  },
  {
    id: 'hypertension',
    title: 'Hipertensão Arterial (Pressão Alta)',
    category: 'cardiovascular',
    shortDesc: 'Restrição de sódio e estímulo a alimentos ricos em potássio e magnésio',
    question: 'Possui pressão alta / Hipertensão Arterial diagnosticada?',
    iconName: 'ShieldAlert',
    badgeBg: 'bg-red-100 border-red-300',
    badgeText: 'text-red-800',
  },
  {
    id: 'hypothyroidism',
    title: 'Hipotireoidismo',
    category: 'hormonal',
    shortDesc: 'Aporte de Selênio, Zinco e cuidado no horário do T4 (Levotiroxina)',
    question: 'Diagnóstico de Hipotireoidismo ou tireoidite de Hashimoto?',
    iconName: 'TrendingDown',
    badgeBg: 'bg-teal-100 border-teal-300',
    badgeText: 'text-teal-800',
  },
  {
    id: 'hyperthyroidism',
    title: 'Hipertireoidismo',
    category: 'hormonal',
    shortDesc: 'Aporte calórico equilibrado e moderação de estimulantes',
    question: 'Diagnóstico de Hipertireoidismo (metabolismo acelerado)?',
    iconName: 'Flame',
    badgeBg: 'bg-rose-100 border-rose-300',
    badgeText: 'text-rose-800',
  },
  {
    id: 'cardiovascular',
    title: 'Problemas Cardiovasculares / Aterosclerose',
    category: 'cardiovascular',
    shortDesc: 'Dieta cardioprotetora, alta em Ômega-3 e fibras solúveis',
    question: 'Histórico de problemas no coração, circulação ou infarto?',
    iconName: 'HeartPulse',
    badgeBg: 'bg-red-100 border-red-300',
    badgeText: 'text-red-800',
  },
  {
    id: 'highCholesterol',
    title: 'Colesterol Alto ou Triglicerídeos Elevados',
    category: 'cardiovascular',
    shortDesc: 'Redução de gorduras saturadas/trans e controle de carboidratos simples',
    question: 'Exames de sangue com LDL alto, HDL baixo ou Triglicerídeos > 150 mg/dL?',
    iconName: 'TrendingUp',
    badgeBg: 'bg-indigo-100 border-indigo-300',
    badgeText: 'text-indigo-800',
  },
  {
    id: 'celiac',
    title: 'Doença Celíaca / Sensibilidade ao Glúten',
    category: 'gastro',
    shortDesc: 'Eliminação total de glúten (Trigo, Centeio, Cevada e contaminação cruzada)',
    question: 'Possui Doença Celíaca ou sensibilidade não celíaca ao glúten?',
    iconName: 'WheatOff',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-900',
  },
  {
    id: 'lactoseIntolerance',
    title: 'Intolerância à Lactose',
    category: 'gastro',
    shortDesc: 'Opção por laticínios Zero Lactose, vegetais e fontes de cálcio não lácteas',
    question: 'Apresenta desconforto ou diagnóstico de Intolerância à Lactose?',
    iconName: 'MilkOff',
    badgeBg: 'bg-cyan-100 border-cyan-300',
    badgeText: 'text-cyan-800',
  },
  {
    id: 'gastritisReflux',
    title: 'Gastrite / Refluxo Gastroesofágico',
    category: 'gastro',
    shortDesc: 'Refeições fracionadas, evitar irritantes gástricos e alimentos muito gordurosos',
    question: 'Apresenta azia, refluxo, gastrite ou queimação estomacal?',
    iconName: 'Flame',
    badgeBg: 'bg-orange-100 border-orange-300',
    badgeText: 'text-orange-900',
  },
  {
    id: 'kidneyIssues',
    title: 'Doença Renal / Cálculo Renal',
    category: 'special',
    shortDesc: 'Ajuste no consumo de proteínas, sódio e controle rigoroso de hidratação',
    question: 'Possui alteração renal, creatinina elevada ou histórico de pedra nos rins?',
    iconName: 'Droplet',
    badgeBg: 'bg-sky-100 border-sky-300',
    badgeText: 'text-sky-800',
  },
  {
    id: 'pregnancyLactation',
    title: 'Gestante ou Lactante',
    category: 'special',
    shortDesc: 'Necessidades acrescidas de Ácido Fólico, Ferro, Cálcio e Proteínas de alto valor',
    question: 'Está grávida ou em período de amamentação?',
    iconName: 'Baby',
    badgeBg: 'bg-pink-100 border-pink-300',
    badgeText: 'text-pink-800',
  },
];

export interface FoodAdvice {
  food: string;
  reason: string;
  category: 'superfood' | 'avoid';
  conditions: string[];
}

export interface DietaryTip {
  title: string;
  description: string;
  condition: string;
  tagBg: string;
}

export function generateHealthGuidance(conditions?: HealthConditions) {
  if (!conditions) {
    return {
      activeCount: 0,
      activeConditions: [],
      superfoods: [],
      foodsToAvoid: [],
      tips: [],
      warnings: [],
    };
  }

  const activeConditionsList: ConditionInfo[] = [];
  HEALTH_CONDITIONS_LIST.forEach((item) => {
    if (conditions[item.id]) {
      activeConditionsList.push(item);
    }
  });

  const superfoods: FoodAdvice[] = [];
  const foodsToAvoid: FoodAdvice[] = [];
  const tips: DietaryTip[] = [];
  const warnings: string[] = [];

  // 1. Diabetes & Resistência à Insulina
  if (conditions.diabetes || conditions.insulinResistance) {
    superfoods.push(
      { food: 'Aveia em Flocos e Psyllium', reason: 'Fibras solúveis (Beta-glucana) que reduzem a absorção de glicose', category: 'superfood', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Ovos e Peito de Frango / Tilápia', reason: 'Proteínas de alto valor biológico que estabilizam o pico insulínico', category: 'superfood', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Abacate e Azeite Extra Virgem', reason: 'Gorduras monoinsaturadas que melhoram a sensibilidade à insulina', category: 'superfood', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Canela em Pó', reason: 'Auxilia na captação celular de glicose', category: 'superfood', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Legumes e Verdes Folhosos', reason: 'Baixa carga glicêmica e alta densidade de micronutrientes', category: 'superfood', conditions: ['Diabetes / Resistência à Insulina'] }
    );

    foodsToAvoid.push(
      { food: 'Açúcar Refinado, Doces e Refrigerantes', reason: 'Causam picos glicêmicos violentos e sobrecarregam o pâncreas', category: 'avoid', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Farinha de Trigo Branca e Pão Francês Isolado', reason: 'Alto índice glicêmico sem fibras para amortecer a digestão', category: 'avoid', conditions: ['Diabetes / Resistência à Insulina'] },
      { food: 'Sucos de Fruta Coados (sem fibra)', reason: 'Concentram frutose livre de rápida absorção', category: 'avoid', conditions: ['Diabetes / Resistência à Insulina'] }
    );

    tips.push({
      title: 'Regra de Ouro do Carboidrato Acompanhado',
      description: 'Nunca consuma carboidratos sozinhos (ex: apenas fruta ou pão). Sempre combine com uma proteína (ovo, queijo, whey) ou gordura boa/fibra (chia, aveia, castanhas) para baixar o Índice Glicêmico.',
      condition: 'Glicemia',
      tagBg: 'bg-amber-100 text-amber-900',
    });

    tips.push({
      title: 'Ordem do Prato (Sequenciamento Alimentar)',
      description: 'Coma primeiro a salada e vegetais, depois a proteína e por último os carboidratos. Isso reduz o pico de glicose pós-prandial em até 30%!',
      condition: 'Glicemia',
      tagBg: 'bg-amber-100 text-amber-900',
    });
  }

  // 2. SOP (Síndrome dos Ovários Policísticos)
  if (conditions.sop) {
    superfoods.push(
      { food: 'Peixes Ricos em Ômega-3 (Sardinha, Tilápia, Salmão)', reason: 'Ação anti-inflamatória potente para redução de andrógenos e melhora da ovulação', category: 'superfood', conditions: ['SOP'] },
      { food: 'Frutas Vermelhas (Morango, Mirtilo, Amora)', reason: 'Baixa carga glicêmica e ricas em antocianinas anti-inflamatórias', category: 'superfood', conditions: ['SOP'] },
      { food: 'Sementes de Abóbora e Girassol', reason: 'Fontes de Zinco e Magnésio cruciais para a produção hormonal feminina', category: 'superfood', conditions: ['SOP'] }
    );

    foodsToAvoid.push(
      { food: 'Alimentos Ultraprocessados e Gordura Trans', reason: 'Aumentam marcadores inflamatórios e pioram a resistência à insulina associada à SOP', category: 'avoid', conditions: ['SOP'] },
      { food: 'Doces de Alto Índice Glicêmico', reason: 'Estimulam o excesso de insulina, que sinaliza aos ovários maior produção de testosterona', category: 'avoid', conditions: ['SOP'] }
    );

    tips.push({
      title: 'Foco Anti-inflamatório na SOP',
      description: 'A SOP está intimamente ligada à inflamação crônica subclínica. Priorize alimentos in natura, temperos naturais (cúrcuma, gengibre, alho) e evite gorduras hidrogenadas.',
      condition: 'SOP',
      tagBg: 'bg-purple-100 text-purple-900',
    });
  }

  // 3. Hipertensão Arterial
  if (conditions.hypertension) {
    superfoods.push(
      { food: 'Banana, Abacate e Batata Doce', reason: 'Ricos em Potássio, que auxilia na excreção renal de sódio e relaxamento vascular', category: 'superfood', conditions: ['Hipertensão'] },
      { food: 'Beterraba e Espinafre', reason: 'Fontes de nitratos naturais que promovem vasodilatação e redução da pressão arterial', category: 'superfood', conditions: ['Hipertensão'] },
      { food: 'Chocolate Amargo (>70% cacau)', reason: 'Flavonoides que estimulam a produção de óxido nítrico e saúde endotelial', category: 'superfood', conditions: ['Hipertensão'] }
    );

    foodsToAvoid.push(
      { food: 'Embutidos (Salame, Peito de Peru, Presunto, Salsicha)', reason: 'Altíssima concentração de sódio e conservantes (nitritos/nitratos industriais)', category: 'avoid', conditions: ['Hipertensão'] },
      { food: 'Temperos Prontos em Caldo/Pó e Molho de Soja (Shoyu)', reason: 'Podem conter mais de 1000mg de sódio por porção', category: 'avoid', conditions: ['Hipertensão'] },
      { food: 'Salgadinhos de Pacote e Comidas Congeladas', reason: 'Excesso de sódio camuflado e gorduras de baixa qualidade', category: 'avoid', conditions: ['Hipertensão'] }
    );

    tips.push({
      title: 'Ajuste do Sal e Ervas Aromáticas',
      description: 'Substitua o sal refinado por Sal de Ervas (sal grosso batido com alecrim, orégano, manjericão e alho). Mantenha a ingestão diária de sódio abaixo de 2.000 mg (< 5g de sal por dia).',
      condition: 'Pressão Alta',
      tagBg: 'bg-red-100 text-red-900',
    });
  }

  // 4. Hipotireoidismo
  if (conditions.hypothyroidism) {
    superfoods.push(
      { food: 'Castanha-do-Pará (1 a 2 unidades/dia)', reason: 'Excelente fonte de Selênio, mineral indispensável na conversão de T4 em T3 ativo', category: 'superfood', conditions: ['Hipotireoidismo'] },
      { food: 'Ovos Caipiras e Peixes', reason: 'Aportam Iodo, Zinco e Tirosina, aminoácido base para síntese dos hormônios tireoidianos', category: 'superfood', conditions: ['Hipotireoidismo'] }
    );

    foodsToAvoid.push(
      { food: 'Vegetais Crucíferos Crus em Excesso (Couve, Repolho, Brócolis)', reason: 'Contêm bócio-gênicos que podem interferir na conversão iodada quando consumidos crus e em grande quantidade. Dica: Refogue ou cozinhe-os!', category: 'avoid', conditions: ['Hipotireoidismo'] },
      { food: 'Soja Não Fermentada em Excesso', reason: 'Isoflavonas podem inibir a peroxidase tireoidiana se o consumo for exagerado', category: 'avoid', conditions: ['Hipotireoidismo'] }
    );

    tips.push({
      title: 'Atenção ao Horário do Medicamento (T4 / Purtaran / Euthyrox)',
      description: 'Tome o medicamento em jejum com água. Espere de 30 a 60 minutos antes de tomar o café da manhã. Evite suplementos de cálcio, ferro ou fibras no mesmo horário.',
      condition: 'Tireoide',
      tagBg: 'bg-teal-100 text-teal-900',
    });
  }

  // 5. Colesterol Alto / Cardio
  if (conditions.cardiovascular || conditions.highCholesterol) {
    superfoods.push(
      { food: 'Aveia e Sementes de Linhaça / Chia', reason: 'Fibras solúveis que se ligam aos sais biliares, reduzindo a reabsorção de colesterol ruim (LDL)', category: 'superfood', conditions: ['Colesterol / Cardio'] },
      { food: 'Azeite de Oliva Extra Virgem', reason: 'Rico em ácido oleico que eleva o HDL e previne a oxidação da placa de ateroma', category: 'superfood', conditions: ['Colesterol / Cardio'] },
      { food: 'Castanhas, Nozes e Amêndoas', reason: 'Ricas em fitoesteróis e gorduras saudáveis cardioprotetoras', category: 'superfood', conditions: ['Colesterol / Cardio'] }
    );

    foodsToAvoid.push(
      { food: 'Cortes de Carne Vermelha Muito Gordos e Bacon', reason: 'Altos em gordura saturada que eleva o LDL oxidado', category: 'avoid', conditions: ['Colesterol / Cardio'] },
      { food: 'Gordura Vegetal Hidrogenada / Trans (Margarina, Biscoitos Recheados)', reason: 'Reduz o colesterol bom (HDL) e eleva significativamente o mau (LDL)', category: 'avoid', conditions: ['Colesterol / Cardio'] }
    );

    tips.push({
      title: 'Estratégia Anti-LDL e Triglicerídeos',
      description: 'Triglicerídeos altos respondem muito rápido ao corte de carboidratos simples (açúcar, sucos, cerveja). Já o LDL diminui com a substituição de gorduras animais saturadas por azeite e peixes.',
      condition: 'Cardiovascular',
      tagBg: 'bg-indigo-100 text-indigo-900',
    });
  }

  // 6. Gastrite / Refluxo
  if (conditions.gastritisReflux) {
    superfoods.push(
      { food: 'Mamão Papaia e Banana Caturra/Prata', reason: 'Textura macia e enzimas digestivas naturais (papaína) que protegem a mucosa', category: 'superfood', conditions: ['Gastrite / Refluxo'] },
      { food: 'Chá de Hortelã-Pimenta ou Camomila Morno', reason: 'Efeito calmante e antiespasmódico na musculatura estomacal', category: 'superfood', conditions: ['Gastrite / Refluxo'] },
      { food: 'Carne de Frango Moída ou Peixe Cozido sem Pimenta', reason: 'Fácil digestão com baixa demanda por ácido clorídrico', category: 'superfood', conditions: ['Gastrite / Refluxo'] }
    );

    foodsToAvoid.push(
      { food: 'Café em Jejum, Refrigerantes e Bebidas Alcoólicas', reason: 'Irritam diretamente o revestimento do estômago e relaxam o esfíncter esofágico', category: 'avoid', conditions: ['Gastrite / Refluxo'] },
      { food: 'Pimentas, Frituras e Comidas Muito Condimentadas', reason: 'Retardam o esvaziamento gástrico e aumentam a acidez', category: 'avoid', conditions: ['Gastrite / Refluxo'] }
    );

    tips.push({
      title: 'Fracionamento e Postura Pós-Refeição',
      description: 'Faça refeições menores a cada 3 horas sem encher demais o estômago. NUNCA se deite antes de 2 a 3 horas após o jantar.',
      condition: 'Estômago',
      tagBg: 'bg-orange-100 text-orange-900',
    });
  }

  // 7. Intolerância a Lactose & Doença Celíaca
  if (conditions.celiac) {
    foodsToAvoid.push({
      food: 'Trigo, Cevada, Centeio e Alimentos com Contaminação Cruzada',
      reason: 'Causam atrofia das vilosidades intestinais no celíaco.',
      category: 'avoid',
      conditions: ['Doença Celíaca'],
    });
    tips.push({
      title: 'Atenção ao Rótulo Sem Glúten',
      description: 'Inspecione cuidadosamente o rótulo ("NÃO CONTÉM GLÚTEN"). Evite compartilhar utensílios ou torradeiras que usam pão comum.',
      condition: 'Glúten',
      tagBg: 'bg-amber-100 text-amber-900',
    });
  }

  if (conditions.lactoseIntolerance) {
    superfoods.push(
      { food: 'Iogurtes Maturados e Queijos Curados (Parmessão, Gouda)', reason: 'Possuem baixíssimo teor natural de lactose devido à fermentação', category: 'superfood', conditions: ['Lactose'] },
      { food: 'Bebidas de Amêndoa ou Coco Fortificadas com Cálcio', reason: 'Substitutos nutritivos e isentos de lactose', category: 'superfood', conditions: ['Lactose'] }
    );
  }

  // 8. Doença Renal
  if (conditions.kidneyIssues) {
    warnings.push('Para problemas renais diagnosticados, mantenha acompanhamento médico e nutricional especializado para ajuste exato da ingestão diária de proteínas (g/kg), sódio, fósforo e potássio.');
    tips.push({
      title: 'Hidratação Calculada e Proteína Moderada',
      description: 'Evite consumo excessivo de proteínas (> 1.8g/kg) sem avaliação da taxa de filtração glomerular. Mantenha a urina sempre clara.',
      condition: 'Renal',
      tagBg: 'bg-sky-100 text-sky-900',
    });
  }

  // 9. Gestação / Lactação
  if (conditions.pregnancyLactation) {
    superfoods.push(
      { food: 'Vegetais Verde-Escuros (Espinafre, Couve)', reason: 'Ricos em Folato (Ácido Fólico) essencial para o sistema nervoso', category: 'superfood', conditions: ['Gestação / Lactação'] },
      { food: 'Ovos com Gema Caipira', reason: 'Excelente fonte de Colina, indispensável para o desenvolvimento cerebral do bebê', category: 'superfood', conditions: ['Gestação / Lactação'] }
    );
    foodsToAvoid.push(
      { food: 'Carnes, Ovos e Peixes Crus ou Malpassados', reason: 'Risco de contaminação por Toxoplasmose e Salmonela', category: 'avoid', conditions: ['Gestação'] },
      { food: 'Adoçantes Artificiais Sacarina/Ciclamato e Excesso de Cafeína (>200mg/dia)', reason: 'Podem ultrapassar a barreira placentária', category: 'avoid', conditions: ['Gestação'] }
    );
  }

  // Default fallback tips if no specific condition selected
  if (activeConditionsList.length === 0) {
    tips.push({
      title: 'Nutrição Preventiva e Longevidade',
      description: 'Sua avaliação não indicou nenhuma condição de saúde específica ativa. Mantenha uma alimentação focada em alimentos in natura, variando cores de vegetais e praticando exercícios físicos regularmente.',
      condition: 'Geral',
      tagBg: 'bg-emerald-100 text-emerald-900',
    });
  }

  return {
    activeCount: activeConditionsList.length,
    activeConditions: activeConditionsList,
    superfoods,
    foodsToAvoid,
    tips,
    warnings,
  };
}
