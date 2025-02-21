import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransportationCarrierComponent } from './carrier.component';

describe('TransportationCarrierComponent', () => {
  let component: TransportationCarrierComponent;
  let fixture: ComponentFixture<TransportationCarrierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationCarrierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationCarrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
