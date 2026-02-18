
export type Language = 'en' | 'mr' | 'hi';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string[];
  gender: 'man' | 'woman';
}

export interface Category {
  id: string;
  name: Record<Language, string>;
  image: string;
}

export interface AdminSettings {
  whatsappNumber: string;
  adminPassword: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}
