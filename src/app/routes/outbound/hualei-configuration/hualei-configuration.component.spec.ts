import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundHualeiConfigurationComponent } from './hualei-configuration.component';

describe('OutboundHualeiConfigurationComponent', () => {
  let component: OutboundHualeiConfigurationComponent;
  let fixture: ComponentFixture<OutboundHualeiConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundHualeiConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundHualeiConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
