import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { WorkOrderBillOfMaterialComponent } from './bill-of-material.component';

  describe('WorkOrderBillOfMaterialComponent', () => {
    let component: WorkOrderBillOfMaterialComponent;
    let fixture: ComponentFixture<WorkOrderBillOfMaterialComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ WorkOrderBillOfMaterialComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(WorkOrderBillOfMaterialComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  