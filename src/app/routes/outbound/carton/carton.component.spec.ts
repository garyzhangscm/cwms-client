import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundCartonComponent } from './carton.component';

describe('OutboundCartonComponent', () => {
  let component: OutboundCartonComponent;
  let fixture: ComponentFixture<OutboundCartonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCartonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCartonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
