import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadWidgetComponent } from './image-upload-widget.component';

describe('ImageUploadWidgetComponent', () => {
  let component: ImageUploadWidgetComponent;
  let fixture: ComponentFixture<ImageUploadWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageUploadWidgetComponent]
    });
    fixture = TestBed.createComponent(ImageUploadWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
