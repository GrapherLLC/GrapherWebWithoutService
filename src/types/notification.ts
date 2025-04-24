export interface EmailNotification {
  email: string,
  name: string,
  newsLetterProduct?: boolean // Product Newsletter
  isActive: boolean
}