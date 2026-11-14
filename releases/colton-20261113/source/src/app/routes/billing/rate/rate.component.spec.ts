import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingRateComponent } from './rate.component';

describe('BillingRateComponent', () => {
  let component: BillingRateComponent;
  let fixture: ComponentFixture<BillingRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
