import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderMpsExportComponent } from './mps-export.component';

describe('WorkOrderMpsExportComponent', () => {
  let component: WorkOrderMpsExportComponent;
  let fixture: ComponentFixture<WorkOrderMpsExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMpsExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMpsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
