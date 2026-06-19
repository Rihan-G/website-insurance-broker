export interface QuoteCompareRow {
    id: string;
    product_type: string;
    estimated_premium: number | null;
    status: string;
    input_data: Record<string, unknown> | null;
    client: {
        full_name: string;
        email: string;
    } | null;
}
export declare function QuoteComparePanel({ quotes }: {
    quotes: QuoteCompareRow[];
}): import("react/jsx-runtime").JSX.Element | null;
