import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryItemSamplingComponent } from './item-sampling.component';

describe('InventoryItemSamplingComponent', () => {
  let component: InventoryItemSamplingComponent;
  let fixture: ComponentFixture<InventoryItemSamplingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryItemSamplingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryItemSamplingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
