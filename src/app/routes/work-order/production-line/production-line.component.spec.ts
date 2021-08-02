import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { WorkOrderProductionLineComponent } from './production-line.component';

  describe('WorkOrderProductionLineComponent', () => {
    let component: WorkOrderProductionLineComponent;
    let fixture: ComponentFixture<WorkOrderProductionLineComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ WorkOrderProductionLineComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(WorkOrderProductionLineComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  