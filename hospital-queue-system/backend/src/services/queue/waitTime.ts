export function estimateWaitTimeMinutes(patientsAhead: number, avgConsultTimeMinutes: number): number {
  const ahead = Math.max(0, patientsAhead);
  const avg = Math.max(0, avgConsultTimeMinutes);
  return ahead * avg;
}
