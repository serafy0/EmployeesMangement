import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signature-canvas-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './singature-canvas-dialog.component.html',
  styleUrls: ['./singature-canvas-dialog.component.scss'],
})
export class SignatureCanvasDialogComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private dialogRef: MatDialogRef<SignatureCanvasDialogComponent>
  ) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = Math.min(900, window.innerWidth * 0.85);
    canvas.height = Math.min(300, window.innerHeight * 0.45);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    this.ctx = ctx;
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#111';
    this.clear();
  }

  pointerDown(ev: PointerEvent) {
    this.drawing = true;
    const pos = this.relativePos(ev);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  pointerMove(ev: PointerEvent) {
    if (!this.drawing) return;
    const pos = this.relativePos(ev);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  pointerUp() {
    this.drawing = false;
  }

  clear() {
    const c = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, c.width, c.height);
    this.ctx.beginPath();
  }

  save() {
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.dialogRef.close(dataUrl);
  }

  cancel() {
    this.dialogRef.close(undefined);
  }

  private relativePos(ev: PointerEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  @HostListener('window:resize')
  onResize() {}
}
