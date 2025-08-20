export interface Script {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'software' | 'sicherheit' | 'konfiguration' | 'befehl';
  isGlobal: boolean;
  autoEnrollment: boolean;
  customers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
}

export const categoryIcons = {
  software: 'Package',
  sicherheit: 'Shield',
  konfiguration: 'Settings',
  befehl: 'Terminal'
} as const;

export const categoryLabels = {
  software: 'Software',
  sicherheit: 'Sicherheit',
  konfiguration: 'Konfiguration',
  befehl: 'Befehl'
} as const;