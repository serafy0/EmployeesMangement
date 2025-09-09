import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const requiredRoles = route.data['roles'] as Array<'Admin' | 'Employee'>;
    if (requiredRoles) {
      const userHasRole = requiredRoles.some((role) =>
        authService.hasRole(role)
      );
      if (userHasRole) {
        return true;
      } else {
        router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
