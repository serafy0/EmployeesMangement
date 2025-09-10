import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SignatureService } from '../../../core/services/signature/signature.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-signature-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDivider,
  ],
  templateUrl: './signature-manager.component.html',
  styleUrls: ['./signature-manager.component.scss'],
})
export class SignatureManagerComponent implements OnInit {
  @ViewChild('fileInputAdmin', { static: false })
  fileInputRef!: ElementRef<HTMLInputElement>;

  userId: string | null = null;
  signatureUrl: string | null = null;
  file: File | null = null;
  uploading = false;
  loading = false;
  private readonly MAX_BYTES = 2 * 1024 * 1024;

  constructor(
    private svc: SignatureService,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'] ?? null;
    this.loadSignature();
  }

  loadSignature() {
    this.loading = true;
    const obs = this.userId
      ? this.svc.getUserSignature(this.userId)
      : this.svc.getMySignature();
    obs.subscribe({
      next: (r: any) => (this.signatureUrl = r?.signatureUrl ?? null),
      error: () => (this.signatureUrl = null),
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  triggerFileChoose() {
    this.fileInputRef?.nativeElement?.click();
  }

  onFileSelected(e: Event) {
    const el = e.target as HTMLInputElement;
    this.file = el.files?.[0] ?? null;
  }

  upload() {
    if (!this.file) {
      this.snack.open('Choose a file first', 'Close', { duration: 3000 });
      return;
    }
    if (this.file.size === 0 || this.file.size > this.MAX_BYTES) {
      this.snack.open('File must be >0 and <= 2MB', 'Close', {
        duration: 4000,
      });
      return;
    }
    this.uploading = true;
    this.svc.uploadFile(this.file, this.userId ?? undefined).subscribe({
      next: (r: any) => {
        this.signatureUrl = r?.signatureUrl ?? this.signatureUrl;
        this.snack.open('Signature uploaded', 'Close', { duration: 3000 });
        this.file = null;
        if (this.fileInputRef?.nativeElement)
          this.fileInputRef.nativeElement.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Upload failed', 'Close', {
          duration: 4000,
        });
      },
      complete: () => (this.uploading = false),
    });
  }

  delete() {
    if (!this.signatureUrl) {
      this.snack.open('No signature to delete', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    this.svc.delete(this.userId ?? undefined).subscribe({
      next: () => {
        this.signatureUrl = null;
        this.snack.open('Signature deleted', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Delete failed', 'Close', {
          duration: 4000,
        });
      },
      complete: () => (this.loading = false),
    });
  }

  openSignature() {
    if (!this.signatureUrl) return;
    window.open(this.signatureUrl, '_blank');
  }
}
