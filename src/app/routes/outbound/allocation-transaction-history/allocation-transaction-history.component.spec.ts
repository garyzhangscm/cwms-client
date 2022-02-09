import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundAllocationTransactionHistoryComponent } from './allocation-transaction-history.component';

describe('OutboundAllocationTransactionHistoryComponent', () => {
  let component: OutboundAllocationTransactionHistoryComponent;
  let fixture: ComponentFixture<OutboundAllocationTransactionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundAllocationTransactionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundAllocationTransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
