interface GrowthBreakdown {
  value: number;
  difference: number;
  percentageChange: number;
}

export const getGrowthBreakdown = (
  total: number,
  currentValue: number,
  previousValue: number
): GrowthBreakdown => {
  const difference = currentValue - previousValue;
  const percentageChange = ((difference / (previousValue || 1)) * 100).toFixed(
    2
  );

  return {
    percentageChange: Number(percentageChange),
    difference,
    value: total,
  };
};
