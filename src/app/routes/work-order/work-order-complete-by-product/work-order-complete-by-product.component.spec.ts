import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product.component';

describe('WorkOrderWorkOrderCompleteByProductComponent', () => {
  let component: WorkOrderWorkOrderCompleteByProductComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteByProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderCompleteByProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderCompleteByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
