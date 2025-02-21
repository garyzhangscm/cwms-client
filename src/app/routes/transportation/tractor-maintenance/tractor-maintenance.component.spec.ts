import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonTractorMaintenanceComponent } from './tractor-maintenance.component';

describe('CommonTractorMaintenanceComponent', () => {
  let component: CommonTractorMaintenanceComponent;
  let fixture: ComponentFixture<CommonTractorMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTractorMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTractorMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
