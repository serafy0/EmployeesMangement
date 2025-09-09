import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-edit.component.html',
})
export class EmployeeEditComponent implements OnInit {
  f: any;
  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  result: any = null;
  id = '';

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
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.svc.getEmployeeById(this.id).subscribe((u: any) => {
        this.f.patchValue({
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phoneNumber,
          nationalId: u.nationalId,
          age: u.age,
          electronicSignature: u.electronicSignature ?? '',
        });
      });
    }
  }

  onSubmit() {
    if (this.f.invalid) return;
    const payload = this.f.value;
    this.svc.updateEmployee(this.id, payload).subscribe({
      next: (res) => {
        this.result = res;
        // stay on page or navigate back
      },
      error: (err) => {
        this.result = err.error ?? err;
      },
    });
  }
}
