import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundCartonizationConfigurationConfirmComponent } from './cartonization-configuration-confirm.component';

describe('OutboundCartonizationConfigurationConfirmComponent', () => {
  let component: OutboundCartonizationConfigurationConfirmComponent;
  let fixture: ComponentFixture<OutboundCartonizationConfigurationConfirmComponent>;

  beforeEach(async(() => {
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
