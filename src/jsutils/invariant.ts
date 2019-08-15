export default function invariant(condition: unknown, message?: string): void {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message || 'Unexpected invariant triggered');
  }
}
