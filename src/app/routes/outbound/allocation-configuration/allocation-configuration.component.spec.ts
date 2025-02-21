import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundAllocationConfigurationComponent } from './allocation-configuration.component';

describe('OutboundAllocationConfigurationComponent', () => {
  let component: OutboundAllocationConfigurationComponent;
  let fixture: ComponentFixture<OutboundAllocationConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundAllocationConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundAllocationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
