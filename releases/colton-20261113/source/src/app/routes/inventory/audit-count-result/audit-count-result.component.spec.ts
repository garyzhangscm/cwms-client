import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryAuditCountResultComponent } from './audit-count-result.component';

describe('InventoryAuditCountResultComponent', () => {
  let component: InventoryAuditCountResultComponent;
  let fixture: ComponentFixture<InventoryAuditCountResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryAuditCountResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAuditCountResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
