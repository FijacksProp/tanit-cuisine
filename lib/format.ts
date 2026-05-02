export function formatNaira(amount: number): string {
  return `\u20A6${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US")
}
