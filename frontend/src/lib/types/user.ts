export interface User {
  id: string;
  name: string;
  email: string;
  role: 'brand' | 'creator';
  phone?: string;
  notificationPrefs?: {
    email: boolean;
    whatsapp: boolean;
  };
}
