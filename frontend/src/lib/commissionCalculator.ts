/** Simple gross-premium → commission estimate for broker desk tools. */
export function estimateCommission(params: {
  premiumMur: number;
  commissionRatePct: number;
  brokerSharePct?: number;
}): { grossCommission: number; brokerNet: number } {
  const grossCommission = (params.premiumMur * params.commissionRatePct) / 100;
  const share = params.brokerSharePct ?? 100;
  const brokerNet = (grossCommission * share) / 100;
  return { grossCommission, brokerNet };
}
