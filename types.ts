export enum ControlType {
  Flame = 'FLAME',
  DrumFan = 'DRUM_FAN',
  CoolingFan = 'COOLING_FAN',
  DrumRotation = 'DRUM_ROTATION',
  DrumSpeed = 'DRUM_SPEED',
}

export enum EventType {
  FirstCrack = 'FIRST_CRACK',
  Discharge = 'DISCHARGE',
  ControlChange = 'CONTROL_CHANGE',
}

export interface RoastEvent {
  timestamp: number;
  type: EventType;
  control?: ControlType;
  value?: string | number;
}

export interface RoastProfile {
  id: string;
  name: string;
  greenBeanWeight: number;
  chargeTemp: number;
  events: RoastEvent[];
  createdAt: string;
  finalWeight?: number;
  finalTemp?: number;
  greenBeanPrice?: number;
  roastFee?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  percentage: number;
  weight: number;
  pricePerKg: number;
}

export interface BusinessInfo {
  brandName: string;
  phone: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
}

export interface ProductList {
  coffee: Product[];
  greenBean: Product[];
  powders: Product[];
}