import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilRfMaintenanceComponent } from './rf-maintenance.component';

describe('UtilRfMaintenanceComponent', () => {
  let component: UtilRfMaintenanceComponent;
  let fixture: ComponentFixture<UtilRfMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilRfMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilRfMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
