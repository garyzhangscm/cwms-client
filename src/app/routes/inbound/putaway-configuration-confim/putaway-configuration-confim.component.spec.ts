import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim.component';

describe('InboundPutawayConfigurationConfimComponent', () => {
  let component: InboundPutawayConfigurationConfimComponent;
  let fixture: ComponentFixture<InboundPutawayConfigurationConfimComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPutawayConfigurationConfimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPutawayConfigurationConfimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
