// Common utilities (logging, formatting, math)
export const formatCurrency = (val, decimals = 5) => {
  if (typeof val !== 'number') return val;
  return val.toFixed(decimals);
};

export default {
  formatCurrency,
};
