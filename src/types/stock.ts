// src/types/stock.ts

export interface StockQuote {
  price:      number;
  open:       number;
  high:       number;
  low:        number;
  close:      number; // previous close
  volume:     number;
  change:     number;
  changePct:  number;
  marketCap?: number;
}

export interface StockFundamentals {
  marketCap?:        number;
  peRatio?:          number;
  pbRatio?:          number;
  dividendYield?:    number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?:  number;
  eps?:              number;
  bookValue?:        number;
  beta?:             number;
  roe?:              number;
  debtToEquity?:     number;
  faceValue?:        number;
  description?:      string;
  website?:          string;
  employees?:        number;
  ceo?:              string;
  founded?:          string;
}

export interface StockDetail {
  id:           string;
  symbol:       string;
  name:         string;
  exchange:     string;
  yahooSymbol:  string;
  sector?:      string;
  industry?:    string;
  quote:        StockQuote | null;
  fundamentals: StockFundamentals | null;
}

export interface HistoricalBar {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface NewsItem {
  title:     string;
  publisher: string;
  link:      string;
  timeAgo:   string;
}

export type Period    = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
export type StockTab  = "Overview" | "Technicals" | "News";
export type OrderSide = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";