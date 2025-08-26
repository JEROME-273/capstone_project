// WeatherService: lightweight rain prediction using Open-Meteo (no API key)

/**
 * Fetch hourly precipitation and probability for the next 24h.
 * @param {number} lat
 * @param {number} lon
 */
export async function fetchOpenMeteo(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}

/**
 * Analyze the next N hours; flag rain if precipitation >= minMm or probability >= minProb.
 * Defaults: 0.2 mm or 50% probability within 6 hours.
 */
export function analyzeHourlyRain(
  data,
  hoursWindow = 6,
  minMm = 0.2,
  minProb = 50
) {
  const hourly = data?.hourly || {};
  const times = hourly.time || [];
  const precip = hourly.precipitation || [];
  const probs = hourly.precipitation_probability || [];

  const now = new Date();
  let startTime;
  let maxPrecip = 0;
  let probability = 0;
  let willRain = false;

  for (let i = 0; i < times.length && i < hoursWindow; i++) {
    const t = new Date(times[i]);
    if (t < now) continue;
    const p = Number(precip?.[i] ?? 0);
    const pr = Number(probs?.[i] ?? 0);
    if (p >= minMm || pr >= minProb) {
      willRain = true;
      if (!startTime) startTime = times[i];
      if (p > maxPrecip) maxPrecip = p;
      if (pr > probability) probability = pr;
    }
  }

  return {
    willRain,
    startTime,
    maxPrecip,
    probability,
    windowHours: hoursWindow,
  };
}

/**
 * High-level helper that returns a user-friendly message if rain is likely.
 */
export async function checkRainSoon(lat, lon, hoursWindow = 6) {
  try {
    const data = await fetchOpenMeteo(lat, lon);
    const a = analyzeHourlyRain(data, hoursWindow);
    if (!a.willRain) return { willRain: false };

    const when = a.startTime
      ? new Date(a.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "soon";
    const intensity = a.maxPrecip >= 2 ? "malakas" : "mahinang";
    const message = `May ${intensity} ulan sa loob ng ${hoursWindow} oras (mga ${when}). Magdala ng payong at, kung madulas/putikan ang dadaanan, magsuot ng bota.`;
    return { willRain: true, message, details: a };
  } catch (e) {
    console.warn("Weather check failed", e);
    return { willRain: false };
  }
}
