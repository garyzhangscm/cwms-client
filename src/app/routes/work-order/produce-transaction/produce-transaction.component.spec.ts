import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProduceTransactionComponent } from './produce-transaction.component';

describe('WorkOrderProduceTransactionComponent', () => {
  let component: WorkOrderProduceTransactionComponent;
  let fixture: ComponentFixture<WorkOrderProduceTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProduceTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProduceTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
