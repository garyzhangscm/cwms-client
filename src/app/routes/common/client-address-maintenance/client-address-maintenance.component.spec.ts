import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance.component';

describe('CommonClientAddressMaintenanceComponent', () => {
  let component: CommonClientAddressMaintenanceComponent;
  let fixture: ComponentFixture<CommonClientAddressMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonClientAddressMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonClientAddressMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
