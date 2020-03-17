import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryAddInventoryComponent } from './add-inventory.component';

describe('InventoryAddInventoryComponent', () => {
  let component: InventoryAddInventoryComponent;
  let fixture: ComponentFixture<InventoryAddInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryAddInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAddInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
