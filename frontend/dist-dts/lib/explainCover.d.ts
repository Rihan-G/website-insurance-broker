export interface CoverExplanation {
    summary: string;
    typicalIncludes: string[];
    watchOut: string[];
}
export declare function explainCover(policyKey: string): CoverExplanation | null;
export declare const coverOptions: {
    key: string;
    label: string;
}[];
