/** Simple gross-premium → commission estimate for broker desk tools. */
export declare function estimateCommission(params: {
    premiumMur: number;
    commissionRatePct: number;
    brokerSharePct?: number;
}): {
    grossCommission: number;
    brokerNet: number;
};
