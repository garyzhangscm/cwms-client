import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportationEasyPostComponent } from './easy-post.component';

describe('TransportationEasyPostComponent', () => {
  let component: TransportationEasyPostComponent;
  let fixture: ComponentFixture<TransportationEasyPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationEasyPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationEasyPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
