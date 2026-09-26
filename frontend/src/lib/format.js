const ZERO_DECIMAL = ["JPY", "KRW", "VND", "CLP", "ISK", "BIF", "DJF", "GNF", "KMF", "PYG", "RWF", "UGX", "VUV", "XAF", "XOF", "XPF"];
const THREE_DECIMAL = ["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"];

// Money is always formatted with the currency's own locale so the symbol and
// separators stay correct regardless of the UI language (including RTL).
const CURRENCY_LOCALE = {
  BRL: "pt-BR", USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", CNY: "zh-CN",
  INR: "en-IN", MXN: "es-MX", ARS: "es-AR", CLP: "es-CL", COP: "es-CO", CAD: "en-CA",
  AUD: "en-AU", CHF: "de-CH", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK", PLN: "pl-PL",
  ZAR: "en-ZA", AED: "en-AE", SAR: "en-SA", SGD: "en-SG", HKD: "en-HK", KRW: "ko-KR",
  TRY: "tr-TR", NGN: "en-NG", ILS: "en-IL", RUB: "ru-RU", THB: "th-TH", VND: "vi-VN",
};

export function decimals(currency = "BRL") {
  const code = (currency || "BRL").toUpperCase();
  if (ZERO_DECIMAL.includes(code)) return 0;
  if (THREE_DECIMAL.includes(code)) return 3;
  return 2;
}

export function formatMoney(cents, currency = "BRL") {
  const code = (currency || "BRL").toUpperCase();
  const d = decimals(code);
  const value = (cents || 0) / Math.pow(10, d);
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[code] || "en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(value);
  } catch {
    return `${value.toFixed(d)} ${code}`;
  }
}

export function toCents(amount, currency = "BRL") {
  const d = decimals(currency);
  return Math.round(parseFloat(amount || 0) * Math.pow(10, d));
}

export function formatDate(value, locale = "pt-BR") {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(value);
  }
}

export function shortId(id) {
  return id ? `${String(id).slice(0, 6)}…${String(id).slice(-4)}` : "—";
}
