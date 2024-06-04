import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { ShopifyIntegrationConfiguration } from '../models/shopify-integration-configuration'; 
import { ShopifyIntegrationConfigurationService } from '../services/shopify-integration-configuration.service';
import { ShopifyOAuthService } from '../services/shopify-oauth.service';

@Component({
  selector: 'app-integration-shopify-integration-configuration',
  templateUrl: './shopify-integration-configuration.component.html',
})
export class IntegrationShopifyIntegrationConfigurationComponent implements OnInit {

  shopifyIntegrationConfigurationList: ShopifyIntegrationConfiguration[] = [];
  shopifyOAuthUrlByCompany = "";
  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];
  selectedClientId?: number;
  isSpinning = false;

  shopifyOAuthUrlByClient: Map<number, string> = new Map();

  
  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private shopifyIntegrationConfigurationService: ShopifyIntegrationConfigurationService, 
    private shopifyOAuthService: ShopifyOAuthService,
    private clientService: ClientService,
    private localCacheService: LocalCacheService,
    private messageService: NzMessageService,) {
      
      // check if 3pl is enabled
      this.localCacheService.getWarehouseConfiguration().subscribe({
        next: (warehouseConfigRes) => {
          if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
            this.threePartyLogisticsFlag = true;
          }
          else {
            this.threePartyLogisticsFlag = false;
          } 
        },  
      });

  
    }

  ngOnInit(): void {   

    if (!this.threePartyLogisticsFlag) {
      // for non 3pl warehouse, we will load the configuration 
      // otherwise, we will let the user choose the client and then load the configuration
      this.isSpinning = true;
      this.shopifyIntegrationConfigurationService.getShopifyIntegrationConfiguration().subscribe({
        next: (shopifyIntegrationConfigurationRes) => {
          this.shopifyIntegrationConfigurationList = shopifyIntegrationConfigurationRes;
          this.isSpinning = false; 
        }, 
        error: () => this.isSpinning = false
      })
    }

    this.initShopifyOAuthUrl();
 
  }
 
  // initialize shopify integration auth URL for the company and all the client
  initShopifyOAuthUrl(): void {
     
    if (this.threePartyLogisticsFlag) {

      this.isSpinning = true;
      this.clientService.getClients().subscribe({

        next: (clientRes) =>{
          this.availableClients = clientRes 
         this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }); 
    } 
    else {
        // for the company
      this.isSpinning = true;
        this.shopifyOAuthService.getOAuthUrl().subscribe({
          next: (shopifyOAuthUrlRes) => {
            this.shopifyOAuthUrlByCompany = shopifyOAuthUrlRes?.url;
            this.isSpinning = false;
          }
          , 
          error: () => this.isSpinning = false
        });
    }
  }

  selectedClientChanged() {
    if (this.selectedClientId != null) {

      // let's see if already have the configuration for this client
      
      this.isSpinning = true;
      this.shopifyIntegrationConfigurationService.getShopifyIntegrationConfiguration(this.selectedClientId).subscribe({
        next: (shopifyIntegrationConfigurationRes) => {
          this.shopifyIntegrationConfigurationList = shopifyIntegrationConfigurationRes;
          // if not done yet, setup the tiktok shop auth link
          if (!this.shopifyOAuthUrlByClient.get(this.selectedClientId!)) {

            this.shopifyOAuthService.getOAuthUrl(this.selectedClientId).subscribe({
              next: (shopifyAuthUrlRes) => {
                if (shopifyAuthUrlRes) {

                  this.shopifyOAuthUrlByClient.set(this.selectedClientId!, shopifyAuthUrlRes.url);
                }
                this.isSpinning = false;
              }, 
              error: () => this.isSpinning = false
                  
            }); 
          }
          else {
            this.isSpinning = false
          }
        }, 
        error: () => this.isSpinning = false
      })
    }
    else {
      
      this.shopifyIntegrationConfigurationList = [];
    }
  } 

  removeShopIntegrationConfiguration(shopifyIntegrationConfiguration: ShopifyIntegrationConfiguration) {

  }
}
