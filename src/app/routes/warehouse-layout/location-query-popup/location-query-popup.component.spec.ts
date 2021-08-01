import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup.component';

describe('WarehouseLayoutLocationQueryPopupComponent', () => {
  let component: WarehouseLayoutLocationQueryPopupComponent;
  let fixture: ComponentFixture<WarehouseLayoutLocationQueryPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseLayoutLocationQueryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseLayoutLocationQueryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
