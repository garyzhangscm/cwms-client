import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UtilFileUploadComponent } from './file-upload.component';

describe('UtilFileUploadComponent', () => {
  let component: UtilFileUploadComponent;
  let fixture: ComponentFixture<UtilFileUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
