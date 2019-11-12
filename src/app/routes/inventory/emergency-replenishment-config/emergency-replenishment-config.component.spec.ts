import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config.component';

describe('InventoryEmergencyReplenishmentConfigComponent', () => {
  let component: InventoryEmergencyReplenishmentConfigComponent;
  let fixture: ComponentFixture<InventoryEmergencyReplenishmentConfigComponent>;

  beforeEach(async(() => {
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
