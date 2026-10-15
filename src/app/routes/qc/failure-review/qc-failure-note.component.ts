import { Component, Input } from '@angular/core';
import { QCInspectionRequestItemOption } from '../models/qc-inspection-request-item-option';
@Component({
  selector: 'app-qc-failure-note', standalone: false,
  template: `
    @if (option.qcInspectionResult === 'FAIL') {
      <div class="failure-note" role="status">
        <p>{{ 'qc-review.inline-warning' | i18n }}</p>
        <label [attr.for]="'qc-note-' + option.id">{{ 'qc-review.notes' | i18n }} *</label>
        <textarea nz-input [id]="'qc-note-' + option.id" rows="3" maxlength="2000"
          [(ngModel)]="option.exceptionNotes" [attr.aria-label]="('qc-review.notes' | i18n) + ': ' + option.qcRuleItem.checkPoint"
          [placeholder]="'qc-review.notes-help' | i18n"></textarea>
        <small>{{ 'qc-review.notes-help' | i18n }} · {{ option.exceptionNotes?.length || 0 }}/2000</small>
      </div>
    }
  `,
  styles: [`:host { display: block; clear: both; } .failure-note { margin-top: 14px; padding: 14px 16px; border-inline-start: 3px solid #d48806; border-radius: 4px; background: rgba(250,173,20,.09); } p { margin: 0 0 10px; } label { display: block; margin-bottom: 6px; font-weight: 600; } small { display: block; margin-top: 6px; opacity: .75; }`]
})
export class QcFailureNoteComponent { @Input({required: true}) option!: QCInspectionRequestItemOption; }
