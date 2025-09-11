import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-initial-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './initial-setup.component.html',
  styleUrls: ['./initial-setup.component.scss'],
})
export class InitialSetupComponent implements OnInit {
  setupForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  resetToken: string | null = null;
  phonePrefilled = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {
    this.setupForm = this.fb.group(
      {
        phoneNumber: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.resetToken = params['token'] || null;
      const phoneFromQuery = params['phone'] || null;
      if (phoneFromQuery) {
        this.setupForm.get('phoneNumber')!.setValue(phoneFromQuery);
        this.setupForm.get('phoneNumber')!.disable();
        this.phonePrefilled = true;
      }
    });
  }

  get phoneNumber() {
    return this.setupForm.get('phoneNumber');
  }
  get newPassword() {
    return this.setupForm.get('newPassword');
  }
  get confirmPassword() {
    return this.setupForm.get('confirmPassword');
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.setupForm.invalid || !this.resetToken) {
      this.errorMessage = 'Token is missing or form is invalid.';
      this.setupForm.markAllAsTouched();
      return;
    }
    this.errorMessage = null;
    const raw = this.setupForm.getRawValue();
    const phoneNumber = raw.phoneNumber;
    const newPassword = raw.newPassword;
    const confirmPassword = raw.confirmPassword;
    this.authService
      .setInitialPassword(
        phoneNumber,
        this.resetToken,
        newPassword,
        confirmPassword
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Password set! Redirecting to dashboard...';
            this.snack.open(this.successMessage, 'Close', { duration: 2000 });
            setTimeout(() => this.router.navigate(['/dashboard']), 2000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (err) => {
          this.errorMessage =
            'An error occurred. Please check your details and try again.';
          console.error(err);
          this.snack.open('Failed to set password', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
