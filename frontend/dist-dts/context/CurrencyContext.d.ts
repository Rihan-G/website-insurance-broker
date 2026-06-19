export type CurrencyCode = "MUR" | "USD" | "GBP" | "EUR";
interface CurrencyInfo {
    code: CurrencyCode;
    symbol: string;
    name: string;
    rate: number;
}
interface CurrencyState {
    currency: CurrencyInfo;
    setCurrency: (code: CurrencyCode) => void;
    format: (amountInMUR: number) => string;
    allCurrencies: CurrencyInfo[];
}
export declare function CurrencyProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCurrency(): CurrencyState;
export {};
