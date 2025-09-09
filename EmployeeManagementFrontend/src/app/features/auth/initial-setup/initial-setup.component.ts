import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-initial-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './initial-setup.component.html',
})
export class InitialSetupComponent implements OnInit {
  setupForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  resetToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.setupForm.invalid || !this.resetToken) {
      this.errorMessage = 'Token is missing or form is invalid.';
      return;
    }
    this.errorMessage = null;
    const { phoneNumber, newPassword, confirmPassword } = this.setupForm.value;
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
            setTimeout(() => this.router.navigate(['/dashboard']), 2000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (err) => {
          this.errorMessage =
            'An error occurred. Please check your details and try again.';
          console.error(err);
        },
      });
  }
}
