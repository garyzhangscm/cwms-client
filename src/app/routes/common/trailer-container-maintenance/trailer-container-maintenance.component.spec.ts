import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonTrailerContainerMaintenanceComponent } from './trailer-container-maintenance.component';

describe('CommonTrailerContainerMaintenanceComponent', () => {
  let component: CommonTrailerContainerMaintenanceComponent;
  let fixture: ComponentFixture<CommonTrailerContainerMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTrailerContainerMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTrailerContainerMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
