import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundListPickConfigurationComponent } from './list-pick-configuration.component';

describe('OutboundListPickConfigurationComponent', () => {
  let component: OutboundListPickConfigurationComponent;
  let fixture: ComponentFixture<OutboundListPickConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundListPickConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundListPickConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
