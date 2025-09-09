import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // If route has role data, check if user has the required role
    const requiredRoles = route.data['roles'] as Array<'Admin' | 'Employee'>;
    if (requiredRoles) {
      const userHasRole = requiredRoles.some((role) =>
        authService.hasRole(role)
      );
      if (userHasRole) {
        return true; // Authorized
      } else {
        router.navigate(['/dashboard']); // Or a dedicated 'unauthorized' page
        return false; // Not authorized
      }
    }
    return true; // Logged in and no specific role required
  }

  // Not logged in, redirect to the login page
  router.navigate(['/login']);
  return false;
};
