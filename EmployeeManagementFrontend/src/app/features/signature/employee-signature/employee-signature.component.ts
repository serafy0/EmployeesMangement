import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignatureService } from '../../../core/services/signature/signature.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-signature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-signature.component.html',
  styleUrls: ['./employee-signature.component.scss'],
})
export class EmployeeSignatureComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('fileInput', { static: false })
  fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  signatureUrl: string | null = null;
  file: File | null = null;
  uploading = false;
  loading = false;
  drawPanelOpen = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;
  private dpr = 1;
  private readonly MAX_BYTES = 2 * 1024 * 1024;
  private readonly ALLOWED = ['.png', '.jpg', '.jpeg', '.svg'];
  isAdmin = false;

  constructor(
    private svc: SignatureService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.hasRole('Admin');
    this.loading = true;
    this.svc.getMySignature().subscribe({
      next: (r: any) => (this.signatureUrl = r?.signatureUrl ?? null),
      error: () => (this.signatureUrl = null),
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  ngAfterViewInit() {
    if (this.drawPanelOpen) this.setupCanvas();
  }

  ngOnDestroy() {
    this.removeCanvasListeners();
  }

  get canAdd(): boolean {
    return !this.signatureUrl && !this.loading && !this.uploading;
  }

  triggerFileChoose() {
    this.fileInputRef?.nativeElement?.click();
  }

  onFileSelected(e: Event) {
    const el = e.target as HTMLInputElement;
    this.file = el.files?.[0] ?? null;
  }

  uploadFile() {
    if (!this.file) {
      this.snack.open('Choose a file first', 'Close', { duration: 3000 });
      return;
    }
    const err = this.validateFile(this.file);
    if (err) {
      this.snack.open(err, 'Close', { duration: 4000 });
      return;
    }
    if (this.signatureUrl) {
      this.snack.open('A signature already exists', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.uploading = true;
    this.svc.uploadFile(this.file).subscribe({
      next: (res: any) => {
        this.signatureUrl = res?.signatureUrl ?? this.signatureUrl;
        this.snack.open('Signature uploaded', 'Close', { duration: 3000 });
        this.file = null;
        if (this.fileInputRef?.nativeElement)
          this.fileInputRef.nativeElement.value = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Upload failed';
        this.snack.open(msg, 'Close', { duration: 5000 });
      },
      complete: () => (this.uploading = false),
    });
  }

  private validateFile(file: File): string | null {
    if (file.size === 0) return 'File is empty';
    if (file.size > this.MAX_BYTES) return 'File too large (max 2 MB)';
    const name = file.name || '';
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
    if (!this.ALLOWED.includes(ext))
      return 'Invalid file type (use png/jpg/svg)';
    return null;
  }

  toggleDrawPanel() {
    if (this.signatureUrl) {
      this.snack.open('A signature already exists', 'Close', {
        duration: 2500,
      });
      return;
    }
    this.drawPanelOpen = !this.drawPanelOpen;
    if (this.drawPanelOpen) {
      setTimeout(() => this.setupCanvas(), 0);
    } else {
      this.removeCanvasListeners();
    }
  }

  private setupCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.removeCanvasListeners();
    this.dpr = window.devicePixelRatio || 1;
    const widthPx = Math.min(720, window.innerWidth - 96);
    const heightPx = 140;
    canvas.style.width = `${widthPx}px`;
    canvas.style.height = `${heightPx}px`;
    canvas.width = Math.round(widthPx * this.dpr);
    canvas.height = Math.round(heightPx * this.dpr);
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 2.2;
    this.ctx.strokeStyle = '#1258d6';
    this.addCanvasListeners();
  }

  private addCanvasListeners() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', this.onPtrDown);
    canvas.addEventListener('pointermove', this.onPtrMove);
    window.addEventListener('pointerup', this.onPtrUp);
    canvas.addEventListener('pointerleave', this.onPtrUp);
  }

  private removeCanvasListeners() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.removeEventListener('pointerdown', this.onPtrDown);
    canvas.removeEventListener('pointermove', this.onPtrMove);
    window.removeEventListener('pointerup', this.onPtrUp);
    canvas.removeEventListener('pointerleave', this.onPtrUp);
  }

  private onPtrDown = (ev: PointerEvent) => {
    if (!this.ctx) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.drawing = true;
    this.lastX = ev.clientX - rect.left;
    this.lastY = ev.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  };

  private onPtrMove = (ev: PointerEvent) => {
    if (!this.ctx || !this.drawing) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const midX = (this.lastX + x) / 2;
    const midY = (this.lastY + y) / 2;
    this.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  };

  private onPtrUp = () => {
    if (!this.ctx) return;
    this.drawing = false;
    this.ctx.closePath();
  };

  clearCanvas() {
    if (!this.canvasRef || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr);
  }

  saveDrawing() {
    if (!this.canvasRef) {
      this.snack.open('Nothing to save', 'Close', { duration: 2000 });
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    this.uploadBase64(dataUrl);
  }

  private uploadBase64(dataUrl: string) {
    if (this.signatureUrl) {
      this.snack.open('A signature already exists', 'Close', {
        duration: 2000,
      });
      return;
    }
    this.loading = true;
    this.svc.uploadBase64(dataUrl).subscribe({
      next: (r: any) => {
        this.signatureUrl = r?.signatureUrl ?? this.signatureUrl;
        this.snack.open('Signature saved', 'Close', { duration: 3000 });
        this.drawPanelOpen = false;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Save failed';
        this.snack.open(msg, 'Close', { duration: 4000 });
      },
      complete: () => {
        this.loading = false;
        this.removeCanvasListeners();
        this.cdr.markForCheck();
      },
    });
  }

  openSignature() {
    if (!this.signatureUrl) return;
    window.open(this.signatureUrl, '_blank');
  }
}
