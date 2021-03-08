import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundGridComponent } from './grid.component';

describe('OutboundGridComponent', () => {
  let component: OutboundGridComponent;
  let fixture: ComponentFixture<OutboundGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
