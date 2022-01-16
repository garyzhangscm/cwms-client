import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderMpsViewComponent } from './mps-view.component';

describe('WorkOrderMpsViewComponent', () => {
  let component: WorkOrderMpsViewComponent;
  let fixture: ComponentFixture<WorkOrderMpsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMpsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMpsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
