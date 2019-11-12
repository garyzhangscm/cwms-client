import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim.component';

describe('CommonClientMaintenanceConfimComponent', () => {
  let component: CommonClientMaintenanceConfimComponent;
  let fixture: ComponentFixture<CommonClientMaintenanceConfimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonClientMaintenanceConfimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonClientMaintenanceConfimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
