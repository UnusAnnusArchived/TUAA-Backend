import { LimitedUser } from "./user";

export default interface CheckLoginKeyResponse {
  isValid: boolean,
  user?: LimitedUser
}