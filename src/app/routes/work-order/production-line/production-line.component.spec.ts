import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { WorkOrderProductionLineComponent } from './production-line.component';

  describe('WorkOrderProductionLineComponent', () => {
    let component: WorkOrderProductionLineComponent;
    let fixture: ComponentFixture<WorkOrderProductionLineComponent>;

    beforeEach(async(() => {
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
  