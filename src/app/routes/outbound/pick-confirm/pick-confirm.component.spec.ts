import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundPickConfirmComponent } from './pick-confirm.component';

describe('OutboundPickConfirmComponent', () => {
  let component: OutboundPickConfirmComponent;
  let fixture: ComponentFixture<OutboundPickConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundPickConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundPickConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
