import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance.component';

describe('CommonUnitOfMeasureMaintenanceComponent', () => {
  let component: CommonUnitOfMeasureMaintenanceComponent;
  let fixture: ComponentFixture<CommonUnitOfMeasureMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonUnitOfMeasureMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonUnitOfMeasureMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
