import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryReplenishmentComponent } from './replenishment.component';

describe('InventoryReplenishmentComponent', () => {
  let component: InventoryReplenishmentComponent;
  let fixture: ComponentFixture<InventoryReplenishmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryReplenishmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryReplenishmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
