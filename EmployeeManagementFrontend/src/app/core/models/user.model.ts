export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  roles: string[];
  isPasswordSet: boolean;
}
