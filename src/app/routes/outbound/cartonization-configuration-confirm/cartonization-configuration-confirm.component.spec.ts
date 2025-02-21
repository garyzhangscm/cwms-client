import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundCartonizationConfigurationConfirmComponent } from './cartonization-configuration-confirm.component';

describe('OutboundCartonizationConfigurationConfirmComponent', () => {
  let component: OutboundCartonizationConfigurationConfirmComponent;
  let fixture: ComponentFixture<OutboundCartonizationConfigurationConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCartonizationConfigurationConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCartonizationConfigurationConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
