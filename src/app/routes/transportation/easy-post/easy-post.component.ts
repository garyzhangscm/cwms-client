import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ReportType } from '../../report/models/report-type.enum';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Carrier } from '../models/carrier';
import { CarrierServiceLevelType } from '../models/carrier-service-level-type.enum';
import { EasyPostCarrier } from '../models/easy-post-carrier';
import { EasyPostConfiguration } from '../models/easy-post-configuration';
import { CarrierService } from '../services/carrier.service';
import { EasyPostConfigurationService } from '../services/easy-post-configuration.service';

@Component({
  selector: 'app-transportation-easy-post',
  templateUrl: './easy-post.component.html',
})
export class TransportationEasyPostComponent implements OnInit {

  isSpinning = false;
  currentEasyPostConfiguration!: EasyPostConfiguration;
  webhookSecretVisible = false;

  allCarriers: Carrier[] = [];
  avaiableCarriers: Carrier[] = [];
  addCarrierModal!: NzModalRef;
  addCarrierForm!: FormGroup;
  reportTypes = ReportType;
  

  constructor(
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private carrierService: CarrierService,
    private easyPostConfigurationService: EasyPostConfigurationService) { 
      this.currentEasyPostConfiguration = {        
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        apiKey: "",
        webhookSecret:  "",    
        carriers: [],
      }
  }

  ngOnInit(): void {
    this.loadConfiguration();

    // load all carrier
    this.carrierService.loadCarriers(true).subscribe(
      {
        next: (carrierRes) => {
          this.allCarriers = carrierRes; 
           
        } ,         
      }
    )
  }

  // load the configuration for current warehouse
  loadConfiguration() {
    this.isSpinning = true;
    this.easyPostConfigurationService.getConfiguration().subscribe(
      {
        next: (configRes) => {
          // we should only get one configuration since
          // we are only allowed to get the configuratoin for current warehouse
          if (configRes) {
            // if we already have the configuration setup for the current warehouse
            // load it. otherwise, load the default one
            
            this.currentEasyPostConfiguration = configRes;
          }
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }); 
  }
  confirm() {
    this.isSpinning = true;
    this.easyPostConfigurationService.addConfiguration(this.currentEasyPostConfiguration)
    .subscribe({

      next: (configurationRes) => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.currentEasyPostConfiguration = configurationRes;
        this.isSpinning = false;
      } , 
      error: () => this.isSpinning = false

    })
  }

  removeCarrier(carrier: EasyPostCarrier): void{
    // if we are creating a new configuration, then we will remove the carrier
    // when we save the new configuration, otherwise, we will remove the carrier 
    // right after the user click the remove button
    
    if (this.currentEasyPostConfiguration.id) {

      this.isSpinning = true;
      this.easyPostConfigurationService.removeCarrier(this.currentEasyPostConfiguration.id, carrier.id!).subscribe(
        {
          next: () => {

            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            // refresh the configuration after we remove the carrier
            this.loadConfiguration();
          }, 
          error: () => this.isSpinning = false

        }
      )
    }
    else {
      this.currentEasyPostConfiguration.carriers = [...this.currentEasyPostConfiguration.carriers.filter(
        easyPostCarrier => easyPostCarrier.carrierId !== carrier.carrierId
      )]
    }
  }

  
  openAddCarrierModal( 
    tplAddCarrierModalTitle: TemplateRef<{}>,
    tplAddCarrierModalContent: TemplateRef<{}>, 
  ): void { 
    this.addCarrierForm = this.fb.group({
       
      carrier: [null],
      accountNumber: [null],
      type: [null]
    });

    // only show the carriers that is
    // 1. provide parcel service
    // 2. not assigned yet
    this.avaiableCarriers = [...this.allCarriers.filter(
      carrier => {
        // filter out if there's no parcel service from this carrier
        if (!carrier.carrierServiceLevels.some(service => service.type === CarrierServiceLevelType.PARCEL)) {
          return false;
        }
        // the carrier is already added
        if (this.currentEasyPostConfiguration.carriers.some(easyPostcarrier => easyPostcarrier.carrierId === carrier.id)) {
          return false;
        }

        return true;
      }
    )];
    console.log(`this.avaiableCarriers.length: ${this.avaiableCarriers.length}`);
    console.log(`this.allCarriers.length: ${this.allCarriers.length}`);

    if (this.avaiableCarriers.length == 0) {
      this.messageService.error(this.i18n.fanyi('no-more-carrier-to-add-to-easy-port'));
      return;
    }

    
    // Load the location
    this.addCarrierModal = this.modalService.create({
      nzTitle: tplAddCarrierModalTitle,
      nzContent: tplAddCarrierModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addCarrierModal.destroy(); 
      },
      nzOnOk: () => {
        if (this.addCarrierForm.controls.carrier.value == '' ||
          this.addCarrierForm.controls.accountNumber.value == '') {
            return false;
          }
        
          this.addCarrierModal.updateConfig({ 
            nzOkDisabled: true,
            nzOkLoading: true
          });
          this.addCarrier( 
            this.addCarrierForm.controls.carrier.value,
            this.addCarrierForm.controls.accountNumber.value,
            this.addCarrierForm.controls.type.value,
          ); 
          this.addCarrierModal.destroy(); 
          return false;
      },

      nzWidth: 1000,
    });
  }
  addCarrier(carrierId: number, accountNumber: string, reportType: ReportType) {
    
    // if this is a new configuration that is not saved yet, let's just add it locally
    // to the confiugration so the carrier will be saved when the configuration is saved

    const carrier : EasyPostCarrier = {        
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      carrierId:carrierId,  
      accountNumber: accountNumber,
      reportType: reportType
    };

    if (this.currentEasyPostConfiguration.id) {

      this.isSpinning = true;
      this.easyPostConfigurationService.addCarrier(this.currentEasyPostConfiguration.id, carrier)
      .subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          this.isSpinning = false;
          // refresh the configuration after we remove the carrier
          this.loadConfiguration();
        }, 
        error: () => this.isSpinning = false
      })
    }
    else {
      this.currentEasyPostConfiguration.carriers = [...this.currentEasyPostConfiguration.carriers, carrier];
    }
  }

}
