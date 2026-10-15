import type { QcInspectionRequest } from '../models/qc-inspection-request';
import type { QCInspectionRequestItemOption } from '../models/qc-inspection-request-item-option';

// This is a preview of the decision; the server validates against its own rules on submission.
export function aggregateQcResults(results: string[]): string {
  if (results.includes('FAIL')) return 'FAIL';
  if (!results.length || results.includes('PENDING') || results.some(r => !['PASS', 'SKIPPED', 'NOT_APPLY', 'CANCELLED'].includes(r))) return 'PENDING';
  return 'PASS';
}
export function failingChecks(requests: QcInspectionRequest[]): QCInspectionRequestItemOption[] {
  return requests.flatMap(r => r.qcInspectionRequestItems ?? []).flatMap(g => g.qcInspectionRequestItemOptions ?? []).filter(o => o.qcInspectionResult === 'FAIL');
}
export function recomputeRequest(request: QcInspectionRequest): void {
  for (const group of request.qcInspectionRequestItems ?? []) {
    group.qcInspectionResult = aggregateQcResults((group.qcInspectionRequestItemOptions ?? []).map(o => o.qcInspectionResult)) as typeof group.qcInspectionResult;
  }
  request.qcInspectionResult = aggregateQcResults((request.qcInspectionRequestItems ?? []).map(g => g.qcInspectionResult)) as typeof request.qcInspectionResult;
}
export function validFailureNotes(options: QCInspectionRequestItemOption[]): boolean {
  return options.every(o => !!o.exceptionNotes?.trim() && o.exceptionNotes.trim().length <= 2000);
}
