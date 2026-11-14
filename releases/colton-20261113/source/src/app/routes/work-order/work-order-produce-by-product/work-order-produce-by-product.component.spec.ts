import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderProduceByProductComponent } from './work-order-produce-by-product.component';

describe('WorkOrderWorkOrderProduceByProductComponent', () => {
  let component: WorkOrderWorkOrderProduceByProductComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderProduceByProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderProduceByProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderProduceByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
