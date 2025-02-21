import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryMixRestrictionComponent } from './inventory-mix-restriction.component';

describe('InventoryInventoryMixRestrictionComponent', () => {
  let component: InventoryInventoryMixRestrictionComponent;
  let fixture: ComponentFixture<InventoryInventoryMixRestrictionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryMixRestrictionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryMixRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
