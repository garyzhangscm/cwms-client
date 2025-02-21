import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IntegrationIntegrationDataInventoryAdjustComponent } from './integration-data-inventory-adjust.component';

describe('IntegrationIntegrationDataInventoryAdjustComponent', () => {
  let component: IntegrationIntegrationDataInventoryAdjustComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataInventoryAdjustComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataInventoryAdjustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataInventoryAdjustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
