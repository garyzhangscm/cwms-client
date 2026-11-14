import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Tractor } from '../models/tractor';
import { TractorStatus } from '../models/tractor-status.enum';
import { Trailer } from '../models/trailer';
import { TractorService } from '../services/tractor.service';
import { TrailerService } from '../services/trailer.service';

@Component({
    selector: 'app-common-tractor-maintenance',
    templateUrl: './tractor-maintenance.component.html',
    standalone: false
})
export class CommonTractorMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentTractor!: Tractor;
  warehouses: Warehouse[] = [];
  warehouseSpecific = false;
  isSpinning = false;
  newTractor = true;
  numberValidateStatus = 'warning'; 
  numberErrorCode='';

  hasAttachedTrailer = true;
  autoCreatedTrailer = true; 
  openTrailers: Trailer[] = [];
  attachedTrailer: Trailer[] = [];
  
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private tractorService: TractorService,
    private trailerService: TrailerService, 
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.currentTractor = this.getEmptyTractor();
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('tractor.maintenance'));
    this.pageTitle = this.i18n.fanyi('tractor.maintenance');

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.tractorService.getTractor(params['id'])
          .subscribe({
            next: (tractorRes) => {
              this.currentTractor = tractorRes; 
  
              this.newTractor = false;
              this.numberValidateStatus = 'success'; 
              this.numberErrorCode='';
            }
          });
      }
      else { 
        this.newTractor = true;
        this.numberValidateStatus = 'warning'; 
        this.numberErrorCode='';
      }
    });


    this.trailerService.getOpenTrailersForTractor().subscribe({
      next: (trailerRes) => {
        this.openTrailers = trailerRes;
      }
    })
  }
  getEmptyTractor(): Tractor{
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
      companyId: this.companyService.getCurrentCompany()!.id, 
  
      number: "",
      description: "", 
   
      licensePlateNumber: "",  
      status: TractorStatus.PENDING,
      attachedTrailers: [],
    };
  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmTractor(): void { 

    const attachedTrailerIds =( this.hasAttachedTrailer && !this.autoCreatedTrailer) ?
        this.attachedTrailer.map(trailer => trailer.id).join(",") : "";
    this.isSpinning= true; 
    if (this.newTractor) {
      this.tractorService.addTractor(this.currentTractor, 
        this.hasAttachedTrailer, this.autoCreatedTrailer, attachedTrailerIds).subscribe({
        next: (tractorRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning= false; 
            this.router.navigateByUrl(`/transportation/tractor?number=${tractorRes.number}`);
          }, 500);
        }, 
        error: () => {
          this.isSpinning= false; }
        }); 
    }
    else {
      this.tractorService.changeTractor(this.currentTractor).subscribe({
      next: (tractorRes) => {
        this.isSpinning= false; 
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.router.navigateByUrl(`/transportation/tractor?number=${tractorRes.number}`);
        }, 500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }

  }
    
  numberChange(event: Event) {  
    this.currentTractor!.number = (event.target as HTMLInputElement).value;
    if (this.currentTractor!.number) {
      // THE USER input the number, let's make sure it is not exists yet
      this.tractorService.getTractors(this.currentTractor!.number).subscribe({
        next: (tractorRes) => {
          if (tractorRes.length > 0) {
            // the tractor is already exists  
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
