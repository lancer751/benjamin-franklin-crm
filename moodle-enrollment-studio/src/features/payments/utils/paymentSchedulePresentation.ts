export function scheduledObligationLabel(
  persistedNumber: number,
  enrollmentFee: string | number,
): string {
  const hasEnrollmentFee = Number(enrollmentFee) > 0;
  if (hasEnrollmentFee && persistedNumber === 1) return "Matrícula";

  const visibleNumber = hasEnrollmentFee
    ? persistedNumber - 1
    : persistedNumber;

  return `Cuota ${Math.max(visibleNumber, 1)}`;
}

export function draftObligationLabel(
  index: number,
  enrollmentFee: string | number,
): string {
  return scheduledObligationLabel(index + 1, enrollmentFee);
}

export function distributeScheduleAmounts(
  total: number,
  enrollmentFee: number,
  laterInstallments: number,
): string[] {
  const count = Math.max(laterInstallments, 1);
  const remainingCents = Math.round((total - enrollmentFee) * 100);
  const base = Math.floor(remainingCents / count);
  const laterAmounts = Array.from({ length: count }, (_, index) =>
    ((base + (index < remainingCents % count ? 1 : 0)) / 100).toFixed(2),
  );

  return enrollmentFee > 0
    ? [enrollmentFee.toFixed(2), ...laterAmounts]
    : laterAmounts;
}
