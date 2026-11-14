import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTrailerComponent } from './trailer.component';

describe('CommonTrailerComponent', () => {
  let component: CommonTrailerComponent;
  let fixture: ComponentFixture<CommonTrailerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTrailerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTrailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
