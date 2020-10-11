import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryReplenishmentComponent } from './replenishment.component';

describe('InventoryReplenishmentComponent', () => {
  let component: InventoryReplenishmentComponent;
  let fixture: ComponentFixture<InventoryReplenishmentComponent>;

  beforeEach(async(() => {
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
