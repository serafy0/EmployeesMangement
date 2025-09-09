import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-create.component.html',
})
export class EmployeeCreateComponent implements OnInit {
  f: any;
  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.f = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      ],
      nationalId: ['', [Validators.required]],
      age: [18, [Validators.required, Validators.min(16)]],
      electronicSignature: [''],
    });
  }

  // f = this.fb.group({
  //   firstName: ['', [Validators.required]],
  //   lastName: ['', [Validators.required]],
  //   phoneNumber: [
  //     '',
  //     [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
  //   ],
  //   nationalId: ['', [Validators.required]],
  //   age: [18, [Validators.required, Validators.min(16)]],
  //   electronicSignature: [''],
  // });

  result: any = null;

  onSubmit() {
    if (this.f.invalid) return;
    const payload = this.f.value;
    this.svc.createEmployee(payload).subscribe({
      next: (res: any) => {
        this.result = res;
        // redirect to signature upload page for this user if created successfully
        const id = res?.employee?.id;
        if (id) {
          this.router.navigate([`/employees/${id}/signature`]);
        }
      },
      error: (err) => {
        console.error(err);
        this.result = err.error ?? err;
      },
    });
  }
}
