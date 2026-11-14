import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonTractorComponent } from './tractor.component';

describe('CommonTractorComponent', () => {
  let component: CommonTractorComponent;
  let fixture: ComponentFixture<CommonTractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
