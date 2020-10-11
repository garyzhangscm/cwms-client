import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { WorkOrderWorkOrderComponent } from './work-order.component';

  describe('WorkOrderWorkOrderComponent', () => {
    let component: WorkOrderWorkOrderComponent;
    let fixture: ComponentFixture<WorkOrderWorkOrderComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ WorkOrderWorkOrderComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(WorkOrderWorkOrderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  