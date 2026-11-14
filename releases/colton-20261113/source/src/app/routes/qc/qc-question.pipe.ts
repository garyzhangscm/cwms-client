import { Pipe, PipeTransform, inject } from '@angular/core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { localizedQcQuestion, QcQuestionText } from './models/qc-question-text';
@Pipe({ name: 'qcQuestion', standalone: true, pure: false })
export class QcQuestionPipe implements PipeTransform {
  private readonly i18n = inject(ALAIN_I18N_TOKEN);
  transform(rule: QcQuestionText | null | undefined): string { return localizedQcQuestion(rule, this.i18n.currentLang); }
}
