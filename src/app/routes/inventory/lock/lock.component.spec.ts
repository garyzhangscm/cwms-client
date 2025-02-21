import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryLockComponent } from './lock.component';

describe('InventoryLockComponent', () => {
  let component: InventoryLockComponent;
  let fixture: ComponentFixture<InventoryLockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryLockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
