import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryItemQueryPopupComponent } from './item-query-popup.component';

describe('InventoryItemQueryPopupComponent', () => {
  let component: InventoryItemQueryPopupComponent;
  let fixture: ComponentFixture<InventoryItemQueryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemQueryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemQueryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
