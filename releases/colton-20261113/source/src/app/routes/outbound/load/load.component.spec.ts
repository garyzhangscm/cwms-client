import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundLoadComponent } from './load.component';

describe('OutboundLoadComponent', () => {
  let component: OutboundLoadComponent;
  let fixture: ComponentFixture<OutboundLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
