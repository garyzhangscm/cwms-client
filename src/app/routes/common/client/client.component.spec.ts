import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { CommonClientComponent } from './client.component';

  describe('CommonClientComponent', () => {
    let component: CommonClientComponent;
    let fixture: ComponentFixture<CommonClientComponent>;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ CommonClientComponent ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommonClientComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  