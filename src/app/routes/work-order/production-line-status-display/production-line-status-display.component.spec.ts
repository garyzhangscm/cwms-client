import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderProductionLineStatusDisplayComponent } from './production-line-status-display.component';

describe('WorkOrderProductionLineStatusDisplayComponent', () => {
  let component: WorkOrderProductionLineStatusDisplayComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineStatusDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineStatusDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineStatusDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
