export interface IUser {
  id: number;
  login?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  authorities?: {name:string}[] | null;
}
