import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderPrePrintLpnLabelComponent } from './pre-print-lpn-label.component';

describe('WorkOrderPrePrintLpnLabelComponent', () => {
  let component: WorkOrderPrePrintLpnLabelComponent;
  let fixture: ComponentFixture<WorkOrderPrePrintLpnLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderPrePrintLpnLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderPrePrintLpnLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
