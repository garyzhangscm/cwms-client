import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonTrailerContainerComponent } from './trailer-container.component';

describe('CommonTrailerContainerComponent', () => {
  let component: CommonTrailerContainerComponent;
  let fixture: ComponentFixture<CommonTrailerContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTrailerContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTrailerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
