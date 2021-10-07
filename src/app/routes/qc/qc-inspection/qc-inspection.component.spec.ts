import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcInspectionComponent } from './qc-inspection.component';

describe('QcQcInspectionComponent', () => {
  let component: QcQcInspectionComponent;
  let fixture: ComponentFixture<QcQcInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
