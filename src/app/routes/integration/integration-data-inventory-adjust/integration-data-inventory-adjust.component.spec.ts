import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataInventoryAdjustComponent } from './integration-data-inventory-adjust.component';

describe('IntegrationIntegrationDataInventoryAdjustComponent', () => {
  let component: IntegrationIntegrationDataInventoryAdjustComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataInventoryAdjustComponent>;

  beforeEach(async(() => {
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
