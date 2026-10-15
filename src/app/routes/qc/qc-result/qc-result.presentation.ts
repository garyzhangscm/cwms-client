import type { QcInspectionRequest } from '../models/qc-inspection-request';
import type { QCInspectionRequestItemOption } from '../models/qc-inspection-request-item-option';

type Translate = (key: string) => string;
const excluded = new Set(['SKIPPED', 'NOT_APPLY', 'CANCELLED']);
const symbols: Record<string, string> = { EQUAL: '=', NOT_EQUAL: '≠', GREAT_THAN: '>', LESS_THAN: '<', GREAT_OR_EQUAL: '≥', LESS_OR_EQUAL: '≤' };
export function resultTone(result: string | undefined): string {
  return result === 'PASS' ? 'pass' : result === 'FAIL' ? 'fail' : result === 'PENDING' ? 'pending' : 'neutral';
}
export function resultLabel(result: string | undefined, t: Translate): string {
  const known = ['PASS', 'FAIL', 'PENDING', 'SKIPPED', 'NOT_APPLY', 'CANCELLED'];
  return result && known.includes(result) ? t(`qc-view.result-${result}`) : result || t('qc-view.not-recorded');
}
function present(value: unknown): boolean { return value !== undefined && value !== null && String(value).trim() !== ''; }
function booleanText(value: unknown, t: Translate): string {
  if (value === true || value === 'true') return t('qc-view.yes');
  if (value === false || value === 'false') return t('qc-view.no');
  return String(value);
}
export function presentCheck(option: QCInspectionRequestItemOption, t: Translate) {
  const rule = option.qcRuleItem;
  const kind = rule?.qcRuleItemType;
  const actual = kind === 'NUMBER' ? option.doubleValue : kind === 'YESNO' ? option.booleanValue : kind === 'STRING' ? option.stringValue : undefined;
  const hasActual = present(actual);
  const expected = rule?.expectedValue;
  const value = present(expected) ? (kind === 'YESNO' ? booleanText(expected, t) : String(expected)) : t('qc-view.not-recorded');
  const operator = rule?.qcRuleItemComparator;
  const standard = !present(expected) ? value : operator === 'LIKE' ? `${t('qc-view.matches')} ${value}` : `${symbols[operator] ?? operator ?? ''} ${value}`.trim();
  const skipped = excluded.has(option.qcInspectionResult);
  return {
    exceptionNotes: option.exceptionNotes?.trim() || '',
    checkpoint: rule?.checkPoint || t('qc-view.unnamed-check'),
    standard,
    actual: hasActual ? (kind === 'YESNO' ? booleanText(actual, t) : String(actual)) : t('qc-view.not-recorded'),
    result: option.qcInspectionResult,
    resultLabel: resultLabel(option.qcInspectionResult, t),
    tone: resultTone(option.qcInspectionResult),
    skipped,
    hasActual,
    needsReview: !hasActual && ['PASS', 'FAIL'].includes(option.qcInspectionResult),
    // Enabled is current rule metadata; never use it to rewrite a historic decision.
    currentlyDisabled: rule?.enabled === false
  };
}
export function presentQcRecord(record: QcInspectionRequest, t: Translate) {
  const inventories = [...(record.inventories ?? []), ...(record.inventory ? [record.inventory] : [])]
    .filter((inventory, index, all) => inventory && all.findIndex(other => inventory.id != null ? other?.id === inventory.id : other === inventory) === index);
  const workOrder = record.workOrder ?? record.workOrderQCSample?.workOrder;
  const inspectionType = record.type || (record.workOrderQCSample ? 'BY_WORK_ORDER_SAMPLING' : '');
  const item = record.item ?? record.inventory?.item ?? inventories.find(i => i.item)?.item ?? workOrder?.item;
  const groups = (record.qcInspectionRequestItems ?? []).map(group => {
    const checks = (group.qcInspectionRequestItemOptions ?? []).map(option => presentCheck(option, t));
    return { name: group.qcRule?.name || t('qc-view.unnamed-rule'), resultLabel: resultLabel(group.qcInspectionResult, t), tone: resultTone(group.qcInspectionResult),
      checks: checks.filter(check => !check.skipped), excluded: checks.filter(check => check.skipped) };
  });
  const checks = groups.flatMap(group => [...group.checks, ...group.excluded]);
  return { ...record, workOrder, allInventories: inventories,
    view: { groups, itemNumber: item?.name || '—', description: item?.description || '—',
      lpns: [...new Set(inventories.map(i => i.lpn).filter(Boolean))].join(', ') || '—',
      resultLabel: resultLabel(record.qcInspectionResult, t), tone: resultTone(record.qcInspectionResult),
      typeLabel: ['BY_INVENTORY', 'BY_ITEM', 'BY_WORK_ORDER_SAMPLING', 'INBOUND_BY_INVENTORY', 'MANUAL_BY_INVENTORY'].includes(inspectionType) ? t(`qc-view.type-${inspectionType}`) : (inspectionType || t('qc-view.type-unknown')),
      total: checks.length, pass: checks.filter(c => c.result === 'PASS').length,
      fail: checks.filter(c => c.result === 'FAIL').length,
      review: checks.filter(c => c.needsReview).length }
  };
}
export type QcResultRecord = ReturnType<typeof presentQcRecord>;
