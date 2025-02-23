import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
  
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Carrier } from '../models/carrier';
import { CarrierServiceLevel } from '../models/carrier-service-level';
import { CarrierServiceLevelType } from '../models/carrier-service-level-type.enum';
import { CarrierService } from '../services/carrier.service';


@Component({
    selector: 'app-transportation-carrier-maintenance',
    templateUrl: './carrier-maintenance.component.html',
    standalone: false
})
export class TransportationCarrierMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  carrierServiceLevelTypes = CarrierServiceLevelType; 
  carrierServiceLevelTypesKeys = Object.keys(this.carrierServiceLevelTypes);

  currentCarrier?: Carrier;
  pageTitle: string;
  newCarrier = true;
   
  carrierNameValidateStatus = 'warning'; 


  stepIndex = 0; 
  isSpinning = false;
  

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private carrierService: CarrierService, 
    private router: Router, ) { 

    this.pageTitle = `${this.i18n.fanyi('menu.main.transport.carrier')} ${this.i18n.fanyi('maintenance')}` ;
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.carrierService.getCarrier(params['id'])
          .subscribe(carrierRes => {
            this.currentCarrier = carrierRes; 

            this.newCarrier = false;
            this.carrierNameValidateStatus = 'success'
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentCarrier = this.getEmptyCarrier();
        this.newCarrier = true;
      }
    });
    
     
  } 

  getEmptyCarrier() : Carrier{
    return { 
      name: '',  
      carrierServiceLevels: [],
      contactorFirstname: "",
      contactorLastname: "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      enabled: true,
 
    }
  }  
  
  addExtraService(): void {
    this.currentCarrier!.carrierServiceLevels = [...this.currentCarrier!.carrierServiceLevels, this.getEmptyService()];
  }

  getEmptyService(): CarrierServiceLevel {
    return {
      name: '', 
    };
  }

  previousStep() {
    this.stepIndex--;
  }
  nextStep() {
    if (this.passValidation()) {

      this.stepIndex++;
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      return this.carrierNameValidateStatus === 'success';
    }
    else if (this.stepIndex === 1) {
      // make sure all the carrier service has name and type
      if (this.currentCarrier?.carrierServiceLevels.some(
        service =>    service.name == "" 
      )) {
        this.messageService.error("carrier-service-name-required");
        return false;
      }
      if (this.currentCarrier?.carrierServiceLevels.some(
        service =>   service.type == null 
      )) {
        this.messageService.error("carrier-service-type-required");
        return false;
      }
    }

    return true;
  }

  confirm() { 
    this.isSpinning = true;    
      
      this.carrierService.addCarrier(this.currentCarrier!).subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/transportation/carrier?name=${this.currentCarrier?.name}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 
  }
  
  removeService(index: number) {

    console.log(`remove index: ${index}`);
    this.currentCarrier!.carrierServiceLevels.splice(index, 1); 

    this.currentCarrier!.carrierServiceLevels = [...this.currentCarrier!.carrierServiceLevels];
 
  }  
  carrierNameChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentCarrier!.name = (event.target as HTMLInputElement).value; 
    if (this.currentCarrier!.name) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.carrierService.getCarriers(this.currentCarrier!.name).subscribe({
        next: (carrierRes) => {
          if (carrierRes.length > 0) {
            // the order is already exists 
            this.carrierNameValidateStatus = 'numberExists'
          }
        }
      })
      this.carrierNameValidateStatus = 'success'
    }
    else {
      this.carrierNameValidateStatus = 'required'
    }
  }
  
  handleNewCarrierAddressChange(address: google.maps.places.PlaceResult) {  
    // this.warehouseAddress = address;
    address.address_components!.forEach(
      addressComponent => {
         
        if (addressComponent.types[0] === 'street_number') {
          // street number
          // address line 1 = street number + street name
          this.currentCarrier!.addressLine1 = `${addressComponent.long_name  } ${  this.currentCarrier!.addressLine1}`;
        }
        else if (addressComponent.types[0] === 'route') {
          // street name
          // address line 1 = street number + street name
          this.currentCarrier!.addressLine1 = `${this.currentCarrier!.addressLine1  } ${  addressComponent.long_name}`;
        } 
        else if (addressComponent.types[0] === 'locality') {
          // city
          this.currentCarrier!.addressCity = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_2') {
          // county
          this.currentCarrier!.addressCounty = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'administrative_area_level_1') {
          // city
          this.currentCarrier!.addressState = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'country') {
          // city
          this.currentCarrier!.addressCountry = addressComponent.long_name;
        } 
        else if (addressComponent.types[0] === 'postal_code') {
          // city
          this.currentCarrier!.addressPostcode = addressComponent.long_name;
        } 
      }

    )
  }
 

  // load google address script
  public loadScript(url: string) {
    const body = <HTMLDivElement> document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }

}
