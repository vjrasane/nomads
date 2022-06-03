export const isType = <T>(
  symbol: symbol, value: any
): value is T => {
  if (typeof value !== 'object') return false;
  if (!(symbol in value)) return false;
  return value[symbol] === symbol;
}; 