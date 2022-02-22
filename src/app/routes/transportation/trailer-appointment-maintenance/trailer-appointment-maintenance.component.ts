import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Trailer } from '../models/trailer';
import { TrailerAppointment } from '../models/trailer-appointment';
import { TrailerAppointmentStatus } from '../models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../models/trailer-appointment-type.enum';
import { TrailerService } from '../services/trailer.service';

@Component({
  selector: 'app-transportation-trailer-appointment-maintenance',
  templateUrl: './trailer-appointment-maintenance.component.html',
})
export class TransportationTrailerAppointmentMaintenanceComponent implements OnInit {

  currentAppointment?: TrailerAppointment;
  trailerAppointmentTypes = TrailerAppointmentType;
  currentTrailer!: Trailer;
  isSpinning = false;
  pageTitle = '';
  stepIndex = 0; 
  addApointmentModal!: NzModalRef;

  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private modalService: NzModalService,
    private trailerService: TrailerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('trailer.maintenance'));
    this.pageTitle = this.i18n.fanyi('trailer.maintenance');

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the current appoint for the trailer
        this.trailerService.getTrailerCurrentAppointment(params.id)
          .subscribe({
            next: (trailerAppoitmentRes) => {
              this.currentAppointment = trailerAppoitmentRes;  
            }
          });
       
          // load the trailer information as well
        this.trailerService.getTrailer(params.id)
          .subscribe({
            next: (trailerRes) => {
              this.currentTrailer = trailerRes;  
            }
          });
      } 
    });

  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm() {}

  
  showAddAppointmentModal( 
    tplAddAppointmentModalTitle: TemplateRef<{}>,
    tplAddAppointmentModalContent: TemplateRef<{}>,
  ): void {
    if (this.currentAppointment != null) {
      this.messageService.error("please refresh the page and remove current appointment from the trailer first");
      return;
    }
    // init the current appoint
    this.currentAppointment = {
      
      companyId: this.companyService.getCurrentCompany()!.id,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      number: "",
      description: "", 
      status: TrailerAppointmentStatus.PLANNED,
    } 

      // show the model
      this.addApointmentModal = this.modalService.create({
        nzTitle: tplAddAppointmentModalTitle,
        nzContent: tplAddAppointmentModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOnCancel: () => {
          this.currentAppointment = undefined;
          this.addApointmentModal.destroy(); 
        },
        nzOnOk: () => {
          if (this.currentAppointment?.number == null) {
            this.messageService.error("number is required");
            return false;
          }
          else if (this.currentAppointment?.type == null) {
            this.messageService.error("type is required");
            return false;
          }
          return true;
        },
        nzWidth: 1000,
      }); 
  }

  currentAppointmentNumberChanged(number: string) { 
    this.currentAppointment!.number = number;
  }
}
