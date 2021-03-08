import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance.component';

describe('CommonUnitOfMeasureMaintenanceComponent', () => {
  let component: CommonUnitOfMeasureMaintenanceComponent;
  let fixture: ComponentFixture<CommonUnitOfMeasureMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
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
