import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Velocity } from '../models/velocity';
import { VelocityService } from '../services/velocity.service';

@Component({
    selector: 'app-common-velocity',
    templateUrl: './velocity.component.html',
    standalone: false
})
export class CommonVelocityComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
    
    
    { title: this.i18n.fanyi("name"),  index: 'name' ,  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' ,  }, 
     
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',
      iif: () => !this.displayOnly   
    },      
  ]; 
  
  
  velocities: Velocity[] = [];
  searchResult = "";

  
  newVelocityModal!: NzModalRef;
  newVelocityForm!: UntypedFormGroup;

  
  displayOnly = false;
  constructor(  
    private velocityService: VelocityService,
    private messageService: NzMessageService, 
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/common/velocity").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );              
    }

  ngOnInit(): void { 
    this.search();
  }

  search(): void {
    this.isSpinning = true;
    this.velocityService.loadVelocities().subscribe({
      next: (velocityRes) => {
        this.velocities = velocityRes; 

        this.isSpinning = true;
      }, 
      error: () => this.isSpinning = false
    })
  }

  removeVelocity(velocity : Velocity): void{
    this.isSpinning = true;
    this.velocityService.removeVelocity(velocity).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.remove.success"));
        this.search();
      }, 
      error: () => this.isSpinning = false
    })
  }

  
  openAddVelocityModel( 
    tplNewVelocityModalTitle: TemplateRef<{}>,
    tplNewVelocityModalContent: TemplateRef<{}>,
  ): void { 
 
    this.newVelocityForm = this.fb.group({
      velocityName: [null],
      velocityDescription: [null], 

    });
    
    this.newVelocityModal = this.modalService.create({
          nzTitle: tplNewVelocityModalTitle,
          nzContent: tplNewVelocityModalContent,
          nzOkText: this.i18n.fanyi('confirm'),
          nzCancelText: this.i18n.fanyi('cancel'),
          nzMaskClosable: false,
          nzOnCancel: () => {
            this.newVelocityModal.destroy();
          },
          nzOnOk: () => { 
            this.addVelocity();
          },    
          nzWidth: 1000,
    });
    
  } 

  addVelocity(): void {
    this.isSpinning = true; 
    this.velocityService.addVelocity({
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      name: this.newVelocityForm.controls.velocityName.value,
      description: this.newVelocityForm.controls.velocityDescription.value
    }).subscribe({

      next: () => {
        this.messageService.success(this.i18n.fanyi("message.create.success"));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    })

  }

}
