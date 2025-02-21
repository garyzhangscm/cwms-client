import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionMoldCountHistoryComponent } from './production-mold-count-history.component';

describe('WorkOrderProductionMoldCountHistoryComponent', () => {
  let component: WorkOrderProductionMoldCountHistoryComponent;
  let fixture: ComponentFixture<WorkOrderProductionMoldCountHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionMoldCountHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionMoldCountHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
