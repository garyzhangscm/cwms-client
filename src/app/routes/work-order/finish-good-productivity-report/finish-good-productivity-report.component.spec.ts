import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderFinishGoodProductivityReportComponent } from './finish-good-productivity-report.component';

describe('WorkOrderFinishGoodProductivityReportComponent', () => {
  let component: WorkOrderFinishGoodProductivityReportComponent;
  let fixture: ComponentFixture<WorkOrderFinishGoodProductivityReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderFinishGoodProductivityReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderFinishGoodProductivityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
