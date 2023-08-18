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
<<<<<<< HEAD

=======
>>>>>>> 656f2222fa4ae4aebad8f31b2d4bb00ce330dabc
  const percentageChange = ((difference / (previousValue || 1)) * 100).toFixed(
    2
  );

  return {
    percentageChange: Number(percentageChange),
    difference,
    value: total,
  };
};
