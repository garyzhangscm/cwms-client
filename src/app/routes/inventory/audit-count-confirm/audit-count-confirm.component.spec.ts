import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryAuditCountConfirmComponent } from './audit-count-confirm.component';

describe('InventoryAuditCountConfirmComponent', () => {
  let component: InventoryAuditCountConfirmComponent;
  let fixture: ComponentFixture<InventoryAuditCountConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryAuditCountConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAuditCountConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
