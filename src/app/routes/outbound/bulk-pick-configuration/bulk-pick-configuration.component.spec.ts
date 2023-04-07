import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundBulkPickConfigurationComponent } from './bulk-pick-configuration.component';

describe('OutboundBulkPickConfigurationComponent', () => {
  let component: OutboundBulkPickConfigurationComponent;
  let fixture: ComponentFixture<OutboundBulkPickConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundBulkPickConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundBulkPickConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
