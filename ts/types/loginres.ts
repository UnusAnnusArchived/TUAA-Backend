import { LimitedUser } from './user'

export default interface LoginResponse {
  isValid: boolean,
  loginKey?: string,
  user?: LimitedUser
}