import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.scss'],
})
export class EmployeeCreateComponent implements OnInit {
  f: any;
  result: any = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.f = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      ],
      nationalId: ['', [Validators.required, Validators.minLength(14)]],
      age: [18, [Validators.required, Validators.min(16)]],
      electronicSignature: [''],
    });
  }

  get controls() {
    return this.f.controls as { [key: string]: any };
  }

  onSubmit() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    this.clearServerErrors();
    this.loading = true;
    const payload = this.f.value;
    this.svc.createEmployee(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.result = res;
        const id = res?.employee?.id;
        if (id) {
          this.router.navigate([`/employees/${id}/signature`]);
        } else {
          this.snack.open('Employee created', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.loading = false;
        const pd = err?.error;
        if (pd && pd.errors && typeof pd.errors === 'object') {
          this.applyServerValidationErrors(pd.errors);
        } else {
          const msg = err.error?.message ?? 'Failed to create employee';
          this.snack.open(msg, 'Close', { duration: 5000 });
          this.result = err.error ?? err;
        }
      },
    });
  }

  private clearServerErrors() {
    Object.keys(this.controls).forEach((key) => {
      const ctrl = this.controls[key];
      if (!ctrl) return;
      const errors = ctrl.errors ?? null;
      if (errors && errors['server']) {
        const clone = { ...errors };
        delete clone['server'];
        if (Object.keys(clone).length === 0) ctrl.setErrors(null);
        else ctrl.setErrors(clone);
      }
    });
  }

  private applyServerValidationErrors(errorsObj: { [key: string]: string[] }) {
    const globalMessages: string[] = [];
    Object.entries(errorsObj).forEach(([serverKey, messages]) => {
      const controlName = this.mapServerKeyToControlName(serverKey);
      const ctrl = this.controls[controlName];
      const joined = Array.isArray(messages)
        ? messages.join(' ')
        : String(messages);
      if (ctrl) {
        const existing = ctrl.errors ?? {};
        ctrl.setErrors({ ...existing, server: joined });
        ctrl.markAsTouched();
      } else {
        globalMessages.push(`${serverKey}: ${joined}`);
      }
    });

    if (globalMessages.length) {
      this.snack.open(globalMessages.join(' — '), 'Close', { duration: 6000 });
    }
  }

  private mapServerKeyToControlName(key: string): string {
    if (!key) return key;
    // direct exact match
    if (this.controls[key]) return key;
    // case-insensitive match
    const lower = key.toLowerCase();
    const found = Object.keys(this.controls).find(
      (c) => c.toLowerCase() === lower
    );
    if (found) return found;
    // snake_case or PascalCase -> camelCase (basic)
    const camel = key
      .replace(/[_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^./, (s) => s.toLowerCase());
    if (this.controls[camel]) return camel;
    // try lowercase-first for Pascal (NationalId -> nationalId)
    const pascalToCamel = key.charAt(0).toLowerCase() + key.slice(1);
    if (this.controls[pascalToCamel]) return pascalToCamel;
    return key;
  }
}
