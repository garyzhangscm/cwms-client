import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { ClientService } from '../../common/services/client.service';
import { TiktokSellerShopIntegrationConfiguration } from '../models/tiktok-seller-shop-integration-configuration';
import { TiktokSellerShopIntegrationConfigurationService } from '../services/tiktok-seller-shop-integration-configuration.service';

@Component({
  selector: 'app-integration-tiktok-seller-shop-integration-configuration',
  templateUrl: './tiktok-seller-shop-integration-configuration.component.html',
})
export class IntegrationTiktokSellerShopIntegrationConfigurationComponent implements OnInit {

  tiktokSellerShopIntegrationConfiguration?: TiktokSellerShopIntegrationConfiguration;
  tiktokSellerShopIntegrationAuthUrl = "";
  threePartyLogisticsFlag = false;

  
  constructor(private http: _HttpClient, 
    private tiktokSellerShopIntegrationConfigurationService: TiktokSellerShopIntegrationConfigurationService, 
    private clientService: ClientService) {
      this.tiktokSellerShopIntegrationConfigurationService.getTiktokSellerShopIntegrationConfiguration().subscribe({
        next: (tiktokSellerShopIntegrationConfigurationRes) => this.tiktokSellerShopIntegrationConfiguration = tiktokSellerShopIntegrationConfigurationRes
      })
  
    }

  ngOnInit(): void { }

  // initialize tiktok seller shop integration auth URL for the company and all the client
  initTiktokSellerShopIntegrationAuthUrl(): void {
    
    // for the company
    this.tiktokSellerShopIntegrationConfigurationService.getTiktokTTSAuthLink().subscribe({
      next: (tiktokSellerShopIntegrationAuthUrlRes) => this.tiktokSellerShopIntegrationAuthUrl = tiktokSellerShopIntegrationAuthUrlRes
    });

    this.clientService.getClients().subscribe({

      next: (clientRes) =>{
        clientRes.forEach(
          client => {
             
            // for each client
            this.tiktokSellerShopIntegrationConfigurationService.getTiktokTTSAuthLink().subscribe({
              next: (tiktokSellerShopIntegrationAuthUrlRes) => this.tiktokSellerShopIntegrationAuthUrl = tiktokSellerShopIntegrationAuthUrlRes
            });
          }
        )
      }
    });  
  }

}
