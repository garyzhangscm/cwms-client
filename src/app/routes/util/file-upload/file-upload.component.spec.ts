import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilFileUploadComponent } from './file-upload.component';

describe('UtilFileUploadComponent', () => {
  let component: UtilFileUploadComponent;
  let fixture: ComponentFixture<UtilFileUploadComponent>;

  beforeEach(async(() => {
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
