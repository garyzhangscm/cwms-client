import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationShopifyIntegrationConfigurationComponent } from './shopify-integration-configuration.component';

describe('IntegrationShopifyIntegrationConfigurationComponent', () => {
  let component: IntegrationShopifyIntegrationConfigurationComponent;
  let fixture: ComponentFixture<IntegrationShopifyIntegrationConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationShopifyIntegrationConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationShopifyIntegrationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
