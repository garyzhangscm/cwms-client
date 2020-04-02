import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryMoveComponent } from './inventory-move.component';

describe('InventoryInventoryMoveComponent', () => {
  let component: InventoryInventoryMoveComponent;
  let fixture: ComponentFixture<InventoryInventoryMoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryMoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
