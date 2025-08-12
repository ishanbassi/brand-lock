
export interface IEmployee {
  id: number;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  createdDate?: Date | null;
  modifiedDate?: Date | null;
  deleted?: boolean | null;
  designation?: string | null;
  joiningDate?: Date | null;
}

export type NewEmployee = Omit<IEmployee, 'id'> & { id: null };


export class Employee{

}