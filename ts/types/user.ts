export default interface User {
  id: string,
  email: string,
  username: string,
  hash: string,
  salt: string,
  pfp: UserProfilePicture,
  loginKeys: string[],
  isAdmin?: boolean
}

export interface UserProfilePicture {
  originalFilename: string,
  filename: string,
  width: number,
  height: number,
  format: string
}

export interface LimitedUser {
  id: string,
  email: string,
  username: string,
  pfp: UserProfilePicture
  isAdmin?: boolean
}
