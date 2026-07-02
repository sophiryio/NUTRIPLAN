/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleFitSession {
  id: string;
  name: string;
  description?: string;
  startTimeMillis: string;
  endTimeMillis: string;
  activityType: number;
  application: {
    packageName?: string;
  };
}

export const mapActivityType = (type: number): { name: string; category: 'strength' | 'cardio' | 'both'; met: number } => {
  switch (type) {
    case 97: // Weightlifting
      return { name: 'Musculação / Força', category: 'strength', met: 4.5 };
    case 9: // Biking / Cycling
      return { name: 'Ciclismo / Pedalada', category: 'cardio', met: 6.5 };
    case 57: // Running
    case 58:
    case 59:
      return { name: 'Corrida', category: 'cardio', met: 8.5 };
    case 11: // Elliptical
      return { name: 'Elíptico / Transport', category: 'cardio', met: 5.0 };
    case 10: // Rowing
      return { name: 'Remo', category: 'cardio', met: 6.0 };
    case 83: // Swimming
    case 84:
      return { name: 'Natação', category: 'cardio', met: 7.0 };
    case 101: // Circuit training
      return { name: 'Treino HIIT / Circuito', category: 'cardio', met: 8.0 };
    case 100: // Calisthenics
      return { name: 'Calistenia', category: 'strength', met: 5.0 };
    case 108: // Other
    default:
      return { name: 'Exercício / Atividade', category: 'cardio', met: 5.0 };
  }
};

export const getAppOrigin = (packageName?: string): string => {
  if (!packageName) return 'Google Fit';
  if (packageName.includes('strava')) return 'Strava';
  if (packageName.includes('shealth') || packageName.includes('oneconnect') || packageName.includes('samsung')) return 'Samsung Health';
  if (packageName.includes('garmin')) return 'Garmin Connect';
  if (packageName.includes('fitbit')) return 'Fitbit';
  if (packageName.includes('apple')) return 'Apple Health';
  return 'Google Fit';
};

/**
 * Fetches fitness sessions from Google Fit within a time range.
 */
export const fetchGoogleFitSessions = async (
  accessToken: string,
  startTimeISO: string,
  endTimeISO: string
): Promise<GoogleFitSession[]> => {
  const url = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${startTimeISO}&endTime=${endTimeISO}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao obter sessões do Google Fit. Verifique suas permissões.');
  }

  const data = await response.json();
  return data.session || [];
};

/**
 * Fetches weight metrics aggregated from Google Fit.
 */
export const fetchGoogleFitWeight = async (
  accessToken: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<{ date: string; weight: number }[]> => {
  const url = `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.weight'
        }],
        bucketByTime: { durationMillis: 86400000 }, // Daily buckets
        startTimeMillis,
        endTimeMillis,
      }),
    });

    if (!response.ok) {
      console.warn('Google Fit weight fetch returned not ok');
      return [];
    }

    const data = await response.json();
    const weights: { date: string; weight: number }[] = [];
    
    if (data.bucket) {
      for (const bucket of data.bucket) {
        if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point) {
          for (const point of bucket.dataset[0].point) {
            if (point.value && point.value[0] && point.value[0].fpVal) {
              const weightVal = point.value[0].fpVal;
              // nanos to millis
              const timestamp = parseInt(point.startTimeNanos) / 1000000;
              const dateStr = new Date(timestamp).toISOString().split('T')[0];
              weights.push({ date: dateStr, weight: parseFloat(weightVal.toFixed(1)) });
            }
          }
        }
      }
    }
    return weights;
  } catch (error) {
    console.error('Error fetching weight from Google Fit:', error);
    return [];
  }
};
