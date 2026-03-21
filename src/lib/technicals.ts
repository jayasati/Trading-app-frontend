
export interface MACDResult {
  macd:      number;
  signal:    number;
  histogram: number;
}

export interface PivotLevels {
  pivot: string;
  r3: string; r2: string; r1: string;
  s1: string; s2: string; s3: string;
}

export interface TechnicalSummary {
  rsi:       number | null;
  macd:      MACDResult | null;
  pivots:    PivotLevels | null;
  signal:    "Strongly Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strongly Bearish";
  bullCount: number;
  bearCount: number;
  neutCount: number;
}

// ─── RSI (Relative Strength Index) ───
export function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d;
    else losses += Math.abs(d);
  }
  const ag = gains / period;
  const al = losses / period;
  if (al === 0) return 100;
  return Math.round((100 - 100 / (1 + ag / al)) * 100) / 100;
}

export function rsiLabel(rsi: number | null): { text: string; color: string } {
  if (rsi === null) return { text: "—", color: "var(--color-text-muted)" };
  if (rsi > 70)    return { text: "Overbought",  color: "var(--color-loss)" };
  if (rsi < 30)    return { text: "Oversold",    color: "var(--color-gain)" };
  if (rsi > 55)    return { text: "Bullish",     color: "var(--color-gain)" };
  if (rsi < 45)    return { text: "Bearish",     color: "var(--color-loss)" };
  return              { text: "Neutral",      color: "var(--color-text-secondary)" };
}

// ─── EMA (Exponential Moving Average) ───
export function calcEMA(data: number[], period: number): number[] {
  if (!data.length) return [];
  const k   = 2 / (period + 1);
  const out = [data[0]];
  for (let i = 1; i < data.length; i++) {
    out.push(data[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

// ─── MACD (12, 26, 9) ───
export function calcMACD(closes: number[]): MACDResult | null {
  if (closes.length < 27) return null;
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const line  = ema12.map((v, i) => v - ema26[i]);
  const sig   = calcEMA(line.slice(-9), 9);
  const macd  = line[line.length - 1];
  const signal = sig[sig.length - 1];
  return {
    macd:      Math.round(macd   * 100) / 100,
    signal:    Math.round(signal * 100) / 100,
    histogram: Math.round((macd - signal) * 100) / 100,
  };
}

// ─── Pivot Points (Classic) ───
export function calcPivots(high: number, low: number, close: number): PivotLevels {
  const p = (high + low + close) / 3;
  return {
    pivot: p.toFixed(2),
    r3:    (high + 2 * (p - low)).toFixed(2),
    r2:    (p + high - low).toFixed(2),
    r1:    (2 * p - low).toFixed(2),
    s1:    (2 * p - high).toFixed(2),
    s2:    (p - high + low).toFixed(2),
    s3:    (low - 2 * (high - p)).toFixed(2),
  };
}

// ─── Overall Technical Summary ───
export function calcSummary(closes: number[], lastBar?: { high: number; low: number; close: number }): TechnicalSummary {
  const rsi   = calcRSI(closes);
  const macd  = calcMACD(closes);
  const pivots = lastBar ? calcPivots(lastBar.high, lastBar.low, lastBar.close) : null;

  // Score each indicator
  let bull = 0, bear = 0, neut = 0;

  if (rsi !== null) {
    if (rsi > 55) bull++;
    else if (rsi < 45) bear++;
    else neut++;
  }
  if (macd !== null) {
    if (macd.macd > 0 && macd.histogram > 0) bull++;
    else if (macd.macd < 0 && macd.histogram < 0) bear++;
    else neut++;
  }
  // Momentum from last 5 closes
  if (closes.length >= 5) {
    const last5 = closes.slice(-5);
    const up    = last5.filter((v, i) => i > 0 && v > last5[i - 1]).length;
    if (up >= 4) bull++;
    else if (up <= 1) bear++;
    else neut++;
  }

  const total = bull + bear + neut;
  const signal =
    bull > 2 && bear === 0 ? "Strongly Bullish" :
    bull > bear            ? "Bullish"          :
    bear > bull + 1        ? "Strongly Bearish" :
    bear > bull            ? "Bearish"          :
                             "Neutral";

  return { rsi, macd, pivots, signal, bullCount: bull, bearCount: bear, neutCount: neut };
}