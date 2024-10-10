import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadUploadService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService
  ) {}
  downLoadImage(path: string, assetType: string | 'images') {
    return this.supabaseService.supabase.storage.from(assetType).download(path);
  }

  uploadImage(filePath: string, file: File, assetType: string | 'images') {
    return this.supabaseService.supabase.storage
      .from(assetType)
      .upload(filePath, file);
  }
}
