import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { TiktokSellerShopIntegrationConfiguration } from '../models/tiktok-seller-shop-integration-configuration';
import { TiktokSellerShopIntegrationConfigurationService } from '../services/tiktok-seller-shop-integration-configuration.service';

@Component({
    selector: 'app-integration-tiktok-seller-shop-integration-configuration',
    templateUrl: './tiktok-seller-shop-integration-configuration.component.html',
    standalone: false
})
export class IntegrationTiktokSellerShopIntegrationConfigurationComponent implements OnInit {

  tiktokSellerShopIntegrationConfigurationList: TiktokSellerShopIntegrationConfiguration[] = [];
  tiktokSellerShopIntegrationAuthUrlByCompany = "";
  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];
  selectedClientId?: number;
  isSpinning = false;

  tiktokSellerShopIntegrationAuthUrlByClient: Map<number, string> = new Map();

  
  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private tiktokSellerShopIntegrationConfigurationService: TiktokSellerShopIntegrationConfigurationService, 
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
      this.tiktokSellerShopIntegrationConfigurationService.getTiktokSellerShopIntegrationConfiguration().subscribe({
        next: (tiktokSellerShopIntegrationConfigurationRes) => {
          this.tiktokSellerShopIntegrationConfigurationList = tiktokSellerShopIntegrationConfigurationRes;
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      })
    }

    this.initTiktokSellerShopIntegrationAuthUrl();
  }

  // initialize tiktok seller shop integration auth URL for the company and all the client
  initTiktokSellerShopIntegrationAuthUrl(): void {
    

    if (this.threePartyLogisticsFlag) {

      this.isSpinning = true;
      this.clientService.getClients().subscribe({

        next: (clientRes) =>{
          this.availableClients = clientRes
          /*
          clientRes.forEach(
            client => {
              // for each client
              this.tiktokSellerShopIntegrationConfigurationService.getTiktokTTSAuthLink(client.id).subscribe({
                next: (tiktokSellerShopIntegrationAuthUrlRes) => 
                    this.tiktokSellerShopIntegrationAuthUrlByClient.set(client.id!, tiktokSellerShopIntegrationAuthUrlRes)
              });
            }
          )
          */
         this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }); 
    } 
    else {
        // for the company
      this.isSpinning = true;
        this.tiktokSellerShopIntegrationConfigurationService.getTiktokTTSAuthLink().subscribe({
          next: (tiktokSellerShopIntegrationAuthUrlRes) => {
            this.tiktokSellerShopIntegrationAuthUrlByCompany = tiktokSellerShopIntegrationAuthUrlRes;
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
      this.tiktokSellerShopIntegrationConfigurationService.getTiktokSellerShopIntegrationConfiguration(this.selectedClientId).subscribe({
        next: (tiktokSellerShopIntegrationConfigurationRes) => {
          this.tiktokSellerShopIntegrationConfigurationList = tiktokSellerShopIntegrationConfigurationRes;
          // if not done yet, setup the tiktok shop auth link
          if (!this.tiktokSellerShopIntegrationAuthUrlByClient.get(this.selectedClientId!)) {

            this.tiktokSellerShopIntegrationConfigurationService.getTiktokTTSAuthLink(this.selectedClientId).subscribe({
              next: (tiktokSellerShopIntegrationAuthUrlRes) => {
                this.tiktokSellerShopIntegrationAuthUrlByClient.set(this.selectedClientId!, tiktokSellerShopIntegrationAuthUrlRes);
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
      
      this.tiktokSellerShopIntegrationConfigurationList = [];
    }
  }

  removeTiktokSellerShopIntegrationConfiguration(tiktokSellerShopIntegrationConfiguration: TiktokSellerShopIntegrationConfiguration) {
    this.isSpinning = true;
    this.tiktokSellerShopIntegrationConfigurationService.removeTiktokSellerShopIntegrationConfiguration(tiktokSellerShopIntegrationConfiguration.id)
    .subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.tiktokSellerShopIntegrationConfigurationList = this.tiktokSellerShopIntegrationConfigurationList.filter(
          ttsIntegrationConfiguration => ttsIntegrationConfiguration.id != tiktokSellerShopIntegrationConfiguration.id
        )
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }
  saveTiktokSellerShopIntegrationConfiguration(tiktokSellerShopIntegrationConfiguration: TiktokSellerShopIntegrationConfiguration) {
    this.isSpinning = true;
    this.tiktokSellerShopIntegrationConfigurationService.changeTiktokSellerShopIntegrationConfiguration(tiktokSellerShopIntegrationConfiguration)
    .subscribe({
      next: (tiktokSellerShopIntegrationConfigurationRes) => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        tiktokSellerShopIntegrationConfiguration = tiktokSellerShopIntegrationConfigurationRes;
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    })
  }
}
