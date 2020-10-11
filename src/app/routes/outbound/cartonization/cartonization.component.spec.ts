import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundCartonizationComponent } from './cartonization.component';

describe('OutboundCartonizationComponent', () => {
  let component: OutboundCartonizationComponent;
  let fixture: ComponentFixture<OutboundCartonizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCartonizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCartonizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
