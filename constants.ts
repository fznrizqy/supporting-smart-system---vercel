import { Equipment, Category, EquipmentStatus, UserRole, User, Division } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Administrator', role: UserRole.Admin, avatar: 'https://picsum.photos/id/64/100/100', email: 'admin@sss.com', password: 'admin' },
  { id: '2', name: 'Fauzan Rizqy Kanz', role: UserRole.Supporting, avatar: 'https://picsum.photos/id/65/100/100', email: 'fauzan.rizqy@siglaboratory.co.id', password: 'supporting' },
  { id: '3', name: 'Muhammad Luthfi Alfiyansyah', role: UserRole.Supporting, avatar: 'https://picsum.photos/id/65/100/100', email: 'luthfialfiyansyah@siglaboratory.co.id', password: 'supporting' },
  { id: '4', name: 'Rizqi Utomo', role: UserRole.Supporting, avatar: 'https://picsum.photos/id/65/100/100', email: 'tomo@siglaboratory.co.id', password: 'supporting' },
  { id: '5', name: 'Emily Chen', role: UserRole.Chemist, avatar: 'https://picsum.photos/id/66/100/100', email: 'chemist@labnexus.com', password: '1234' },
  { id: '6', name: 'Mike Ross', role: UserRole.Analyst, avatar: 'https://picsum.photos/id/67/100/100', email: 'analyst@labnexus.com', password: '1234' },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'SIG/FNA/ALB/AP-1096',
    category: Category.BALANCE_ANA,
    brand: 'Mettler Toledo',
    model: 'ME2O4TE/OO',
    serialNumber: 'COO3913936',
    installationDate: '2025-01-01',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Timbang MS Lt. 3 Gd. B',
    calibrationMeasuringPoint: '0g, 10g, 50g, 100g, 200g',
    personInCharge: 'Rizqi Utomo'
  },
  {
    id: 'SIG/FNA/ALB/IN-0249',
    category: Category.GCMS,
    brand: 'Shimadzu',
    model: 'GCMS-QP2020NX',
    serialNumber: 'O21746003467',
    installationDate: '2025-01-01',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Instrumen GC Lt. 3 Gd. B',
    calibrationMeasuringPoint: '50-400 m/z',
    personInCharge: 'Fauzan Rizqy Kanz'
  },
  {
    id: 'SIG/FNA/ALB/AP-1367',
    category: Category.MICROPIPETTE,
    brand: 'Eppendorf',
    model: 'Reasearch Plus',
    serialNumber: 'G29523K',
    installationDate: '2025-01-21',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Preparasi GC Lt. 3 Gd. B',
    calibrationMeasuringPoint: '10µL, 50µL, 100µL',
    personInCharge: 'Muhammad Luthfi'
  },
  {
    id: 'SIG/FNA/ALB/AP-1710',
    category: Category.PHMETER,
    brand: 'Horiba Scientific',
    model: 'LAQUA-PC2000',
    serialNumber: 'JK1J0020',
    installationDate: '2025-01-01',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Preparasi LC Lt. 3 Gd. B',
    calibrationMeasuringPoint: 'pH 4.01, pH 7.00, pH 10.01',
    personInCharge: 'Emily Chen'
  },
  {
    id: 'SIG/FNA/ALB/AP-2508',
    category: Category.CENTRIFUGE,
    brand: 'Thermo Scientific',
    model: 'Sorvall ST 8',
    serialNumber: '42866914',
    installationDate: '2025-01-01',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Preparasi LC Lt. 3 Gd. B',
    calibrationMeasuringPoint: '1000rpm, 3000rpm, 5000rpm',
    personInCharge: 'Mike Ross'
  },
  {
    id: 'SIG/FNA/ALB/IN-0246',
    category: Category.LCMS,
    brand: 'Shimadzu',
    model: 'LCMS-8045',
    serialNumber: 'O11405900935',
    installationDate: '2025-01-21',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Instrumen LC Lt. 3 Gd. B',
    calibrationMeasuringPoint: 'Flow 0.5mL/min, Temp 40°C',
    personInCharge: 'Fauzan Rizqy Kanz'
  },
  {
    id: 'SIG/FNA/ALB/AP-1925',
    category: Category.ULTRASONIC,
    brand: 'Elma',
    model: 'S300H - 28L',
    serialNumber: '1106995-001',
    installationDate: '2025-01-01',
    status: EquipmentStatus.OK,
    division: Division.MS,
    location: 'R. Preparasi LC Lt. 3 Gd. B',
    calibrationMeasuringPoint: 'Frequency 37kHz',
    personInCharge: 'Rizqi Utomo'
  }
];

export const STATUS_COLORS: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  [EquipmentStatus.Service]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  [EquipmentStatus.Calibration]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  [EquipmentStatus.Verification]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  [EquipmentStatus.Unused]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};