import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundPickConfigurationComponent } from './pick-configuration.component';

describe('OutboundPickConfigurationComponent', () => {
  let component: OutboundPickConfigurationComponent;
  let fixture: ComponentFixture<OutboundPickConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundPickConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundPickConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
