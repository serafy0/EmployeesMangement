import { EmployeeDTO } from './employee.model';

export interface EmployeeDTOForAdmins extends EmployeeDTO {
  id: string;
  isPasswordSet: boolean;
}
