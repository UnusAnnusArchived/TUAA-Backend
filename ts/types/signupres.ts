export default interface SignUpResponse {
  success: boolean,
  loginURI?: string,
  error?: {
    code: number,
    message: string
  }
}