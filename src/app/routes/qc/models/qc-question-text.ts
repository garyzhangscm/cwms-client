export interface QcQuestionText { checkPoint?: string; checkPointEs?: string | null; }
export function localizedQcQuestion(rule: QcQuestionText | null | undefined, language: string): string {
  if (language.toLowerCase().startsWith('es') && rule?.checkPointEs?.trim()) return rule.checkPointEs.trim();
  return rule?.checkPoint || '';
}
