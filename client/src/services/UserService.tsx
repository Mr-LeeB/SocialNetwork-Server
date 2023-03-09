import { BaseService } from "./BaseService";

export class UserService extends BaseService {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  registerUser = (userRegister: any) => {
    return this.post(`/users`, userRegister);
  };
}

export const userService = new UserService();
