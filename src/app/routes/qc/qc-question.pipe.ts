import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18NService } from '@core';
import { localizedQcQuestion, QcQuestionText } from './models/qc-question-text';
@Pipe({ name: 'qcQuestion', standalone: true, pure: false })
export class QcQuestionPipe implements PipeTransform {
  private readonly i18n = inject(I18NService);
  transform(rule: QcQuestionText | null | undefined): string { return localizedQcQuestion(rule, this.i18n.currentLang); }
}
