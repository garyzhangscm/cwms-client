import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance.component';

describe('InboundReceiptMaintenanceComponent', () => {
  let component: InboundReceiptMaintenanceComponent;
  let fixture: ComponentFixture<InboundReceiptMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundReceiptMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundReceiptMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
