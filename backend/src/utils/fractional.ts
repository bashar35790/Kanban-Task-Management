export function computePosition(prevPos: number | null, nextPos: number | null): number {
  if (prevPos === null && nextPos === null) return 1000.0;
  if (prevPos === null) return nextPos! / 2;
  if (nextPos === null) return prevPos + 1000.0;
  return (prevPos + nextPos) / 2;
}

export function needsRebalance(positions: number[]): boolean {
  if (positions.length < 2) return false;
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] < 1e-6) return true;
  }
  return false;
}

export function rebalancePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * 1000);
}
