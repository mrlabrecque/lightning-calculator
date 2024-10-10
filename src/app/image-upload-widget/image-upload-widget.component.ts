import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DownloadUploadService } from '../services/download-upload.service';

@Component({
  selector: 'app-image-upload-widget',
  templateUrl: './image-upload-widget.component.html',
  styleUrls: ['./image-upload-widget.component.scss'],
})
export class ImageUploadWidgetComponent implements OnInit {
  @Input() assetId: string = '0';
  _imageUrl: SafeResourceUrl | undefined;
  _assetType: string | undefined;
  uploading = false;

  @Input() assetType: string = 'teams';
  @Input() imageUrl: string = '';

  @Output() upload = new EventEmitter<string>();

  constructor(
    private readonly downloadUploadService: DownloadUploadService,
    private readonly dom: DomSanitizer
  ) {}
  ngOnInit(): void {
    if (this.imageUrl) {
      this.downloadImage(this.imageUrl);
    }
  }

  async downloadImage(path: string) {
    try {
      const { data } = await this.downloadUploadService.downLoadImage(
        `${path}`,
        this.assetType
      );
      if (data instanceof Blob) {
        this._imageUrl = this.dom.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(data)
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error downloading image: ', error.message);
      }
    }
  }

  async uploadImage(event: any) {
    try {
      this.uploading = true;
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `private/${this.assetId}/${Math.random()}.${fileExt}`;

      await this.downloadUploadService.uploadImage(
        filePath,
        file,
        this.assetType
      );
      this.upload.emit(filePath);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.uploading = false;
    }
  }
}
