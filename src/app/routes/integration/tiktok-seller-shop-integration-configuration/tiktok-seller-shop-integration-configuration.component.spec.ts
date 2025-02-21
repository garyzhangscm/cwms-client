import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationTiktokSellerShopIntegrationConfigurationComponent } from './tiktok-seller-shop-integration-configuration.component';

describe('IntegrationTiktokSellerShopIntegrationConfigurationComponent', () => {
  let component: IntegrationTiktokSellerShopIntegrationConfigurationComponent;
  let fixture: ComponentFixture<IntegrationTiktokSellerShopIntegrationConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationTiktokSellerShopIntegrationConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationTiktokSellerShopIntegrationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
