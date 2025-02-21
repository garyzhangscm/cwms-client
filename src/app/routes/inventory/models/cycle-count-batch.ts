export interface CycleCountBatch {
  id: number;
  batchId: string;
  requestLocationCount: number;
  openLocationCount: number;
  finishedLocationCount: number;
  cancelledLocationCount: number;
  openAuditLocationCount: number;
  finishedAuditLocationCount: number;
}
