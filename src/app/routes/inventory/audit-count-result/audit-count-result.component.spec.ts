import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryAuditCountResultComponent } from './audit-count-result.component';

describe('InventoryAuditCountResultComponent', () => {
  let component: InventoryAuditCountResultComponent;
  let fixture: ComponentFixture<InventoryAuditCountResultComponent>;

  beforeEach(async(() => {
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
