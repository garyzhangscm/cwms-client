import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundCreateReceiptFromPoComponent } from './create-receipt-from-po.component';

describe('InboundCreateReceiptFromPoComponent', () => {
  let component: InboundCreateReceiptFromPoComponent;
  let fixture: ComponentFixture<InboundCreateReceiptFromPoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundCreateReceiptFromPoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundCreateReceiptFromPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
