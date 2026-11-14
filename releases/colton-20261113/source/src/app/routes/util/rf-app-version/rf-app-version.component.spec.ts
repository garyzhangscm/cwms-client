import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilRfAppVersionComponent } from './rf-app-version.component';

describe('UtilRfAppVersionComponent', () => {
  let component: UtilRfAppVersionComponent;
  let fixture: ComponentFixture<UtilRfAppVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilRfAppVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilRfAppVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
