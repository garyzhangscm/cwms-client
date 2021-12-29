import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOrderActivityComponent } from './order-activity.component';

describe('OutboundOrderActivityComponent', () => {
  let component: OutboundOrderActivityComponent;
  let fixture: ComponentFixture<OutboundOrderActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOrderActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOrderActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
