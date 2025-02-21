import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryInventoryStatusComponent } from './inventory-status.component';

describe('InventoryInventoryStatusComponent', () => {
  let component: InventoryInventoryStatusComponent;
  let fixture: ComponentFixture<InventoryInventoryStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryInventoryStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInventoryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
