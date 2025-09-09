import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get controls() {
    return this.loginForm.controls as { [key: string]: any };
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    const { phoneNumber, password } = this.loginForm.value;

    this.authService.login(phoneNumber, password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message;
          this.snack.open(this.errorMessage || 'Login failed', 'Close', {
            duration: 3000,
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'An error occurred during login. Please try again.';
        console.error(err);
        this.snack.open(this.errorMessage, 'Close', { duration: 3000 });
      },
    });
  }
}
