import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryMovementPathConfirmComponent } from './movement-path-confirm.component';

describe('InventoryMovementPathConfirmComponent', () => {
  let component: InventoryMovementPathConfirmComponent;
  let fixture: ComponentFixture<InventoryMovementPathConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryMovementPathConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryMovementPathConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
