import { QC_QUESTION_ES_FALLBACK } from './qc-question-es-fallback';
export interface QcQuestionText { id?: number; checkPoint?: string; checkPointEs?: string | null; }
export function localizedQcQuestion(rule: QcQuestionText | null | undefined, language: string): string {
  const original = rule?.checkPoint || '';
  if (!language.toLowerCase().startsWith('es')) return original;
  if (rule?.checkPointEs?.trim()) return rule.checkPointEs.trim();
  // Only compensate for an OMITTED API field. Preserve an explicit blank/null,
  // and never guess a translation after the English question or identity changes.
  if (rule && rule.checkPointEs === undefined && rule.id != null) {
    const fallback = QC_QUESTION_ES_FALLBACK[rule.id];
    if (fallback?.english.trim() === original.trim()) return fallback.spanish;
  }
  return original;
}
