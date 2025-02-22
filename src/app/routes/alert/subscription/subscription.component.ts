import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { I18NService } from '@core'; 
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
 
import { UserService } from '../../auth/services/user.service'; 
import { AlertDeliveryChannel } from '../models/alert-delivery-channel';
import { AlertSubscription } from '../models/alert-subscription';
import { AlertType } from '../models/alert-type';
import { AlertSubscriptionService } from '../services/alert-subscription.service';

@Component({
    selector: 'app-alert-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.less'],
    standalone: false
})
export class AlertSubscriptionComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  userAlertSubscriptionMap = new Map<string, AlertSubscription>();
   
  isSpinning = false;

  alertTypes = AlertType;
  alertDeliveryChannels = AlertDeliveryChannel; 
  alertDeliveryChannelsKeys = Object.keys(this.alertDeliveryChannels);
  currentAlertSubscription?: AlertSubscription;

  keyWordsFilterModal!: NzModalRef;
  keyWordsFilterForm!: UntypedFormGroup;

  lastKeyWordControllerIndex: number = 0;

  displayOnly = false;
  constructor(
    private alertSubscriptionService: AlertSubscriptionService, 
    private messageService: NzMessageService,
    private fb: UntypedFormBuilder,
    private modalService: NzModalService,
    private userService: UserService,  ) {
      userService.isCurrentPageDisplayOnly("/alert/subscription").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );   
     }

  ngOnInit(): void { 

    this.isSpinning = true;

    this.alertSubscriptionService.getAlertSubscriptions(this.userService.getCurrentUsername())
    .subscribe({
      next: (userAlertSubscriptionRes) => {  
        this.setupAllAlertSubscriptions(userAlertSubscriptionRes);
        this.isSpinning = false;  
      }
    })

  } 
  setupAllAlertSubscriptions(userAlertSubscriptions: AlertSubscription[]) {
    
    // get all the alert type and delivery channel and setup the 2 D table with
    // columns are the delivery channel and the rows are the types and cell is
    // whether the current user is subscribed to the alert type by the delivery channel
    // then we will allow the user to subscribe or unsubscribe to the type by 
    // the specific channel 
    
    // save the user's subscription to the map so it will be easy for us to find
    // which alert type & delivery channel is already subscribed
    // we will use this information to setup the display
    // key: alert type - delivery channel
    // value: alert subscription
    this.userAlertSubscriptionMap = new Map<string, AlertSubscription>();
    
    userAlertSubscriptions.forEach(
      userAlertSubscription => this.addNewAlertSubscriptionToMap(userAlertSubscription)
    ) 
  }
  // add the new subscription to the local map
  addNewAlertSubscriptionToMap(userAlertSubscription: AlertSubscription) {
    // setup the fields that will be used in the web client
    this.setupMissingFields(userAlertSubscription);

    this.userAlertSubscriptionMap.set(
      `${userAlertSubscription.type.toString()  }-${  userAlertSubscription.deliveryChannel.toString()}`,
      userAlertSubscription

    )

  }
  setupMissingFields(userAlertSubscription: AlertSubscription) {
    userAlertSubscription.keyWords = [];
    if (userAlertSubscription.keyWordsList != null && 
      userAlertSubscription.keyWordsList.length > 0) {
      userAlertSubscription.keyWords = userAlertSubscription.keyWordsList.split(",")
    }
    userAlertSubscription.subscribed = true;

  }

  // get the enum keys
  enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
  
  }

  toggleSubscription(checked: boolean, alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel) {
    if (checked) {
      this.subscribe(alertType, alertDeliveryChannel);
    }
    else {
      
      this.unsubscribe(alertType, alertDeliveryChannel);
    }
  }
  subscribe( alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel){

    this.isSpinning = true;
    this.alertSubscriptionService.subscribe(alertType, alertDeliveryChannel).subscribe(
      {
        next: (alertSubscriptionRes) => {
          // add the newly subscribed alert to the map
          if (!this.userAlertSubscriptionMap.has(`${alertType.toString()  }-${ alertDeliveryChannel.toString()}`)) {
            this.addNewAlertSubscriptionToMap(alertSubscriptionRes)
          }
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          this.isSpinning = false;

        }, 
        error: () => this.isSpinning = false
      }
    )
    
  }
  unsubscribe( alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel){

    this.isSpinning = true;
    this.alertSubscriptionService.unsubscribe(alertType, alertDeliveryChannel).subscribe(
      {
        next: (alertSubscriptionRes) => {
          // remove the newly unsubscribed alert from the map
          if (this.userAlertSubscriptionMap.has(`${alertType.toString()  }-${ alertDeliveryChannel.toString()}`)) {
            this.userAlertSubscriptionMap.delete(
              `${alertType.toString()  }-${ alertDeliveryChannel.toString()}`
            )
          }
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          this.isSpinning = false;

        }, 
        error: () => this.isSpinning = false
      }
    )
    
  }

  
  openKeyWordsFilterModal(
    alertType: AlertType, 
    alertDeliveryChannel: AlertDeliveryChannel,
    tplKeyWordsFilterModalTitle: TemplateRef<{}>,
    tplKeyWordsFilterModalContent: TemplateRef<{}>,
  ): void { 

    // get the alert subscription according to the 
    // type and channel
    if (this.userAlertSubscriptionMap.has(`${alertType.toString()  }-${ alertDeliveryChannel.toString()}`)) {
        this.currentAlertSubscription = 
            this.userAlertSubscriptionMap.get(`${alertType.toString()  }-${ alertDeliveryChannel.toString()}`);
        // setup missing field that necessary for the client display
        this.setupMissingFields(this.currentAlertSubscription!);  
        
        // dynamic setup the form, according to the existing key words
        this.keyWordsFilterForm = this.buildKeyWordsFilterForm(this.currentAlertSubscription!);
        this.lastKeyWordControllerIndex = Object.keys(this.keyWordsFilterForm.controls).length;

        // create the modal
        this.keyWordsFilterModal = this.modalService.create({
          nzTitle: tplKeyWordsFilterModalTitle,
          nzContent: tplKeyWordsFilterModalContent,
          nzOkText: this.i18n.fanyi('confirm'),
          nzCancelText: this.i18n.fanyi('cancel'),
          nzMaskClosable: false,
          nzOnCancel: () => {
            this.keyWordsFilterModal.destroy();
          },
          nzOnOk: () => {
            this.changeKeyWordsFilter(
              this.currentAlertSubscription!,
              this.keyWordsFilterForm
            )
          },
    
          nzWidth: 1000,
        });
    }
    else {
      this.messageService.error("can-not-get-subscription-information");
      return;
    }
  }
  changeKeyWordsFilter(alertSubscription: AlertSubscription, keyWordsFilterForm: UntypedFormGroup) {
    let keyWords : string[] = [];
    for (const field in keyWordsFilterForm.controls) { 
      // 'field' is a string
      if (keyWordsFilterForm.get(field)?.value && keyWordsFilterForm.get(field)?.value.length > 0) {

        keyWords = [
          ...keyWords, 
          keyWordsFilterForm.get(field)?.value]
      }
    
    }
    // change the key words list according to the new value
    alertSubscription.keyWords = keyWords;
    alertSubscription.keyWordsList = keyWords.join(",")
    this.alertSubscriptionService.changeKeyWords(
      alertSubscription.type, alertSubscription.deliveryChannel, 
      alertSubscription.keyWordsList
    ).subscribe(
      {
        next: (alertSubscriptionRes) => this.addNewAlertSubscriptionToMap(alertSubscriptionRes)
      }
    )
    

  }

  buildKeyWordsFilterForm(alertSubscription: AlertSubscription) { 
    const group: any = {}; 

    // add existing keyword to the form
    alertSubscription.keyWords!.forEach((keyWord, index) => {
      group[`${index}`] = new UntypedFormControl(keyWord);
       
    });

    // add a empty text box at the last 
    group[`${alertSubscription.keyWords!.length}`] = new UntypedFormControl('');


    return this.fb.group(group
    );
  }
  addKeyWord() {
    const nextKeyWordIndex = Object.keys(this.keyWordsFilterForm.controls).length;
    this.keyWordsFilterForm.addControl(`${nextKeyWordIndex}`, new UntypedFormControl(''));

    // point the last control index to the new value so that we can 
    // re-render the modal with right form
    this.lastKeyWordControllerIndex = Object.keys(this.keyWordsFilterForm.controls).length; 
  }
}
