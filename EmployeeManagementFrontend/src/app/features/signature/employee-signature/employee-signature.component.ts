import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignatureService } from '../../../core/services/signature/signature.service';

@Component({
  selector: 'app-employee-signature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./employee-signature.component.html`,
})
export class EmployeeSignatureComponent implements OnInit {
  signatureUrl: string | null = null;
  file: File | null = null;
  result: any = null;

  constructor(private svc: SignatureService) {}

  ngOnInit() {
    this.svc
      .getMySignature()
      .subscribe((r) => (this.signatureUrl = r.signatureUrl));
  }

  onFile(e: any) {
    this.file = e.target.files?.[0] ?? null;
  }

  upload() {
    if (!this.file) return;
    this.svc.uploadFile(this.file).subscribe({
      next: (r) => {
        this.result = r;
        this.signatureUrl = r.signatureUrl;
      },
      error: (err) => (this.result = err.error ?? err),
    });
  }

  delete() {
    this.svc.delete().subscribe({
      next: (r) => {
        this.result = r;
        this.signatureUrl = null;
      },
      error: (err) => (this.result = err.error ?? err),
    });
  }
}
