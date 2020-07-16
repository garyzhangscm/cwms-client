import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundAllocationConfigurationComponent } from './allocation-configuration.component';

describe('OutboundAllocationConfigurationComponent', () => {
  let component: OutboundAllocationConfigurationComponent;
  let fixture: ComponentFixture<OutboundAllocationConfigurationComponent>;

  beforeEach(async(() => {
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
