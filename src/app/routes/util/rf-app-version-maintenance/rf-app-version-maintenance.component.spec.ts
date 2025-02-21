import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilRfAppVersionMaintenanceComponent } from './rf-app-version-maintenance.component';

describe('UtilRfAppVersionMaintenanceComponent', () => {
  let component: UtilRfAppVersionMaintenanceComponent;
  let fixture: ComponentFixture<UtilRfAppVersionMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilRfAppVersionMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilRfAppVersionMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
