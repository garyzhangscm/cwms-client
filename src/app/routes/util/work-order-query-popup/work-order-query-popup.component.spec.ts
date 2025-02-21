import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilWorkOrderQueryPopupComponent } from './work-order-query-popup.component';

describe('UtilWorkOrderQueryPopupComponent', () => {
  let component: UtilWorkOrderQueryPopupComponent;
  let fixture: ComponentFixture<UtilWorkOrderQueryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilWorkOrderQueryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilWorkOrderQueryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
