import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config.component';

describe('InventoryEmergencyReplenishmentConfigComponent', () => {
  let component: InventoryEmergencyReplenishmentConfigComponent;
  let fixture: ComponentFixture<InventoryEmergencyReplenishmentConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryEmergencyReplenishmentConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryEmergencyReplenishmentConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
