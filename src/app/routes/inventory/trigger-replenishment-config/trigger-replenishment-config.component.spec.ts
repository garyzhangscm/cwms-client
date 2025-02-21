import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config.component';

describe('InventoryTriggerReplenishmentConfigComponent', () => {
  let component: InventoryTriggerReplenishmentConfigComponent;
  let fixture: ComponentFixture<InventoryTriggerReplenishmentConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryTriggerReplenishmentConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryTriggerReplenishmentConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
