import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundReceiptConfirmComponent } from './receipt-confirm.component';

describe('InboundReceiptConfirmComponent', () => {
  let component: InboundReceiptConfirmComponent;
  let fixture: ComponentFixture<InboundReceiptConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundReceiptConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundReceiptConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
