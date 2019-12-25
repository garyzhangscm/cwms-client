import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundPutawayConfigurationComponent } from './putaway-configuration.component';

describe('InboundPutawayConfigurationComponent', () => {
  let component: InboundPutawayConfigurationComponent;
  let fixture: ComponentFixture<InboundPutawayConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPutawayConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPutawayConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
