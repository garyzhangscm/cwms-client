import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {} from 'jasmine';
import { WorkOrderWorkOrderProduceConfirmComponent } from './work-order-produce-confirm.component';

describe('WorkOrderWorkOrderProduceConfirmComponent', () => {
  let component: WorkOrderWorkOrderProduceConfirmComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderProduceConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderProduceConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderProduceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
