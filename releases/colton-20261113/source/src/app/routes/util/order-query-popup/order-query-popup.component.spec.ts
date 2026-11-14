import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilOrderQueryPopupComponent } from './order-query-popup.component';

describe('UtilOrderQueryPopupComponent', () => {
  let component: UtilOrderQueryPopupComponent;
  let fixture: ComponentFixture<UtilOrderQueryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilOrderQueryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilOrderQueryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
