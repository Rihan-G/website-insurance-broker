import { createContext, useContext, useState, useCallback } from "react";

export type CurrencyCode = "MUR" | "USD" | "GBP" | "EUR";

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number;
}

const currencies: Record<CurrencyCode, CurrencyInfo> = {
  MUR: { code: "MUR", symbol: "₨", name: "Mauritian Rupee", rate: 1 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.022 },
  GBP: { code: "GBP", symbol: "£", name: "Pound Sterling", rate: 0.017 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.020 },
};

interface CurrencyState {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  format: (amountInMUR: number) => string;
  allCurrencies: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyState | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<CurrencyCode>("MUR");

  const currency = currencies[current];

  const format = useCallback(
    (amountInMUR: number) => {
      const converted = amountInMUR * currency.rate;
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: currency.code === "MUR" ? 0 : 2,
        maximumFractionDigits: currency.code === "MUR" ? 0 : 2,
      }).format(converted);
      return `${currency.symbol} ${formatted}`;
    },
    [currency]
  );

  const setCurrencyByCode = useCallback((code: CurrencyCode) => {
    setCurrent(code);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: setCurrencyByCode,
        format,
        allCurrencies: Object.values(currencies),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
