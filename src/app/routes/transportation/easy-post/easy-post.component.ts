import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

import { Printer } from '../../report/models/printer';
import { ReportType } from '../../report/models/report-type.enum';
import { PrinterService } from '../../report/services/printer.service';
import { DateTimeService } from '../../util/services/date-time.service';
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
  printers: Printer[] = [];
  
  shipFromAddress?: Address;
  returnAddress?: Address;
  

  constructor(
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private carrierService: CarrierService,  
    private dateTimeService: DateTimeService,
    private easyPostConfigurationService: EasyPostConfigurationService, 
    private pirnterService: PrinterService) { 
      this.currentEasyPostConfiguration = {        
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        apiKey: "",
        webhookSecret:  "",    
        carriers: [],
        useWarehouseAddressAsShipFromFlag: true,
        useWarehouseAddressAsReturnFlag: true,
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

    // load all the printers
    this.pirnterService.getPrinters().subscribe({
      next: (printerRes) => this.printers = printerRes
    })
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
  setupShipFromAddress(address: Address) {
    this.currentEasyPostConfiguration.addressLine1 = "";
    this.currentEasyPostConfiguration.addressCity = "";
    this.currentEasyPostConfiguration.addressCounty = "";
    this.currentEasyPostConfiguration.addressState = "";
    this.currentEasyPostConfiguration.addressCountry = "";
    this.currentEasyPostConfiguration.addressPostcode = "";
    address.address_components.forEach(
      addressComponent => {
        if (addressComponent.types[0] === 'street_number') {
            this.currentEasyPostConfiguration.addressLine1 = `${addressComponent.long_name} ${this.currentEasyPostConfiguration.addressLine1}`;
        }
        else if  (addressComponent.types[0] === 'route') {
          this.currentEasyPostConfiguration.addressLine1 = `${this.currentEasyPostConfiguration.addressLine1} ${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'locality') {
          this.currentEasyPostConfiguration.addressCity = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'administrative_area_level_2') {
          this.currentEasyPostConfiguration.addressCounty = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'administrative_area_level_1') {
          this.currentEasyPostConfiguration.addressState = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'country') {
          this.currentEasyPostConfiguration.addressCountry = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'postal_code') {
          this.currentEasyPostConfiguration.addressPostcode = `${addressComponent.long_name}`;
        }
      }

    )
  }
  
  setupReturnAddress(address: Address) {
    this.currentEasyPostConfiguration.returnAddressLine1 = "";
    this.currentEasyPostConfiguration.returnAddressCity = "";
    this.currentEasyPostConfiguration.returnAddressCounty = "";
    this.currentEasyPostConfiguration.returnAddressState = "";
    this.currentEasyPostConfiguration.returnAddressCountry = "";
    this.currentEasyPostConfiguration.returnAddressPostcode = "";
    address.address_components.forEach(
      addressComponent => {
        if (addressComponent.types[0] === 'street_number') {
            this.currentEasyPostConfiguration.returnAddressLine1 = `${addressComponent.long_name} ${this.currentEasyPostConfiguration.returnAddressLine1}`;
        }
        else if  (addressComponent.types[0] === 'route') {
          this.currentEasyPostConfiguration.returnAddressLine1 = `${this.currentEasyPostConfiguration.returnAddressLine1} ${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'locality') {
          this.currentEasyPostConfiguration.returnAddressCity = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'administrative_area_level_2') {
          this.currentEasyPostConfiguration.returnAddressCounty = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'administrative_area_level_1') {
          this.currentEasyPostConfiguration.returnAddressState = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'country') {
          this.currentEasyPostConfiguration.returnAddressCountry = `${addressComponent.long_name}`;
        }
        else if  (addressComponent.types[0] === 'postal_code') {
          this.currentEasyPostConfiguration.returnAddressPostcode = `${addressComponent.long_name}`;
        }
      }

    )
  }
  confirm() {

    if (!this.currentEasyPostConfiguration.useWarehouseAddressAsShipFromFlag) {
        if (this.shipFromAddress == null ) {
          this.messageService.error("ship-from-address-required");
          return;
        }
        else {
          this.setupShipFromAddress(this.shipFromAddress);
        }
    }
    if (!this.currentEasyPostConfiguration.useWarehouseAddressAsReturnFlag){
        if (this.returnAddress == null ) {
          this.messageService.error("return-address-required");
          return;
        }
        else {
          this.setupReturnAddress(this.returnAddress);
        }

    }
    
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
      type: [null],
      printerName: [null],
      printParcelLabelAfterManifest: [null],
      labelCopyCount: [null],
      schedulePickupAfterManifest: [null],
      minPickupTime: [null],
      maxPickupTime: [null],
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
          console.log(`this.addCarrierForm.controls.minPickupTime.value: ${this.addCarrierForm.controls.minPickupTime.value}`);
          console.log(`this.addCarrierForm.controls.maxPickupTime.value: ${this.addCarrierForm.controls.maxPickupTime.value}`);
          this.addCarrier( 
            this.addCarrierForm.controls.carrier.value,
            this.addCarrierForm.controls.accountNumber.value,
            this.addCarrierForm.controls.type.value,
            this.addCarrierForm.controls.printerName.value,
            this.addCarrierForm.controls.printParcelLabelAfterManifest.value,
            this.addCarrierForm.controls.labelCopyCount.value,
            this.addCarrierForm.controls.schedulePickupAfterManifest.value,
            this.addCarrierForm.controls.minPickupTime.value,
            this.addCarrierForm.controls.maxPickupTime.value,
          ); 
          this.addCarrierModal.destroy(); 
          return false;
      },

      nzWidth: 1000,
    });
  }
  addCarrier(carrierId: number, accountNumber: string, reportType: ReportType, 
    printerName: string, printParcelLabelAfterManifest: boolean,
    labelCopyCount: number, 
    schedulePickupAfterManifest: boolean, minPickupTime: string, maxPickupTime: string) {
    
    // if this is a new configuration that is not saved yet, let's just add it locally
    // to the confiugration so the carrier will be saved when the configuration is saved

    console.log(`minPickupTime: ${formatDate(minPickupTime, 'HHmm', 'en-US')}`);
    console.log(`maxPickupTime: ${formatDate(maxPickupTime, 'HHmm', 'en-US')}`);
    const carrier : EasyPostCarrier = {        
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      carrierId:carrierId,  
      accountNumber: accountNumber,
      reportType: reportType,
      printerName: printerName,
      printParcelLabelAfterManifestFlag: printParcelLabelAfterManifest,
      labelCopyCount: labelCopyCount == null ? 1 : labelCopyCount,
      schedulePickupAfterManifestFlag: schedulePickupAfterManifest,
      minPickupTime: formatDate(minPickupTime, 'HHmm', 'en-US'),
      maxPickupTime: formatDate(maxPickupTime, 'HHmm', 'en-US'),
    };

    console.log(`EasyPostCarrier: ${JSON.stringify(carrier)}`);
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
 
  handleShipFromAddressChange(address: Address) {  
    this.shipFromAddress = address;
     
  }
  handleReturnAddressChange(address: Address) {  
    this.returnAddress = address;
     
  }
}
