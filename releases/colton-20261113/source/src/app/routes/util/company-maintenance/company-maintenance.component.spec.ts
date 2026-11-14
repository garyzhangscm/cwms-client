import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilCompanyMaintenanceComponent } from './company-maintenance.component';

describe('UtilCompanyMaintenanceComponent', () => {
  let component: UtilCompanyMaintenanceComponent;
  let fixture: ComponentFixture<UtilCompanyMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilCompanyMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilCompanyMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
