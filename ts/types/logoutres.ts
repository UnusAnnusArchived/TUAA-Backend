export default interface LogoutResponse {
  status: 'success'|'error',
  error?: string
}