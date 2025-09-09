import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignatureService } from '../../../core/services/signature/signature.service';

@Component({
  selector: 'app-signature-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signature-manager.component.html',
})
export class SignatureManagerComponent implements OnInit {
  userId: string | null = null;
  signatureUrl: string | null = null;
  file: File | null = null;
  result: any = null;

  constructor(private svc: SignatureService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'] ?? null;
    if (this.userId) {
      this.svc
        .getUserSignature(this.userId)
        .subscribe((r: any) => (this.signatureUrl = r.signatureUrl));
    } else {
      this.svc
        .getMySignature()
        .subscribe((r: any) => (this.signatureUrl = r.signatureUrl));
    }
  }

  onFile(e: any) {
    this.file = e.target.files?.[0] ?? null;
  }

  upload() {
    if (!this.file) return;
    this.svc.uploadFile(this.file, this.userId ?? undefined).subscribe({
      next: (r) => {
        this.result = r;
        this.signatureUrl = r.signatureUrl;
      },
      error: (err) => (this.result = err.error ?? err),
    });
  }

  delete() {
    this.svc.delete(this.userId ?? undefined).subscribe({
      next: (r) => {
        this.result = r;
        this.signatureUrl = null;
      },
      error: (err) => (this.result = err.error ?? err),
    });
  }
}
