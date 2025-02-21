import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Trailer } from '../models/trailer'; 
import { TrailerService } from '../services/trailer.service';

@Component({
    selector: 'app-common-trailer-maintenance',
    templateUrl: './trailer-maintenance.component.html',
    standalone: false
})
export class CommonTrailerMaintenanceComponent implements OnInit {

  pageTitle = '';
  stepIndex = 0;
  currentTrailer!: Trailer;
  warehouses: Warehouse[] = [];
  warehouseSpecific = false;
  isSpinning = false;
  newTrailer = true;
  numberValidateStatus = 'warning'; 
  numberErrorCode='';
  
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private trailerService: TrailerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.currentTrailer = this.getEmptyTrailer();
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('trailer.maintenance'));
    this.pageTitle = this.i18n.fanyi('trailer.maintenance');

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.trailerService.getTrailer(params.id)
          .subscribe({
            next: (trailerRes) => {
              this.currentTrailer = trailerRes; 
  
              this.newTrailer = false;
              this.numberValidateStatus = 'success'; 
              this.numberErrorCode='';
            }
          });
      }
      else { 
        this.newTrailer = true;
        this.numberValidateStatus = 'warning'; 
        this.numberErrorCode='';
      }
    });


  }
  getEmptyTrailer(): Trailer{
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
 
      companyId: this.companyService.getCurrentCompany()!.id,
  
  
      number: "",
      description: "",
      size: 0,
    };
  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmTrailer(): void { 

    this.isSpinning= true; 
    if (this.newTrailer) {
      this.trailerService.addTrailer(this.currentTrailer).subscribe({
        next: (trailerRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning= false; 
            this.router.navigateByUrl(`/transportation/trailer?number=${trailerRes.number}`);
          }, 500);
        }, 
        error: () => {
          this.isSpinning= false; }
        }); 
    }
    else {
      this.trailerService.changeTrailer(this.currentTrailer).subscribe({
      next: (trailerRes) => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning= false; 
          this.router.navigateByUrl(`/transportation/trailer?number=${trailerRes.number}`);
        }, 500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }

  }
    
  numberChange(event: Event) {  
    this.currentTrailer!.number = (event.target as HTMLInputElement).value;
    if (this.currentTrailer!.number) {
      // THE USER input the number, let's make sure it is not exists yet
      this.trailerService.getTrailers(this.currentTrailer!.number).subscribe({
        next: (trailerRes) => {
          if (trailerRes.length > 0) {
            // the trailer is already exists  
            this.numberValidateStatus = 'error'; 
            this.numberErrorCode = 'numberExists'
          }
        }
      })
      this.numberValidateStatus = 'success'
      this.numberErrorCode = ''
    }
    else {
      this.numberValidateStatus = 'error'
      this.numberErrorCode = 'required'
    }
  }
  
}
