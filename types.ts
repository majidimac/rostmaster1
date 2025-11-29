/**
 * Enum for the different types of controls on the roaster.
 */
export enum ControlType {
  Flame = 'FLAME',
  DrumFan = 'DRUM_FAN',
  CoolingFan = 'COOLING_FAN',
  DrumRotation = 'DRUM_ROTATION',
  DrumSpeed = 'DRUM_SPEED',
}

/**
 * Enum for the different types of events that can occur during a roast.
 */
export enum EventType {
  FirstCrack = 'FIRST_CRACK',
  SecondCrack = 'SECOND_CRACK',
  Discharge = 'DISCHARGE',
  ControlChange = 'CONTROL_CHANGE',
}

/**
 * Represents a single event that occurs during a roast.
 */
export interface RoastEvent {
  /** The time in seconds since the start of the roast when the event occurred. */
  timestamp: number;
  /** The type of the event. */
  type: EventType;
  /** The control that was changed (for control change events). */
  control?: ControlType;
  /** The new value of the control (for control change events). */
  value?: string | number;
}

/**
 * Represents a complete roast profile.
 */
export interface RoastProfile {
  /** A unique identifier for the roast profile. */
  id: string;
  /** The name of the roast profile. */
  name: string;
  /** The weight of the green beans in grams. */
  greenBeanWeight: number;
  /** The temperature at which the beans were charged into the roaster. */
  chargeTemp: number;
  /** An array of all the events that occurred during the roast. */
  events: RoastEvent[];
  /** The date and time when the roast profile was created. */
  createdAt: string;
  /** The final weight of the beans in grams after roasting. */
  finalWeight?: number;
  /** The final temperature of the beans at the end of the roast. */
  finalTemp?: number;
  /** The price of the green beans per kilogram. */
  greenBeanPrice?: number;
  /** The fee for roasting the beans. */
  roastFee?: number;
}

/**
 * Represents a single ingredient in a coffee mix.
 */
export interface Ingredient {
  /** A unique identifier for the ingredient. */
  id: string;
  /** The name of the ingredient. */
  name: string;
  /** The percentage of this ingredient in the mix. */
  percentage: number;
  /** The weight of this ingredient in grams. */
  weight: number;
  /** The price of this ingredient per kilogram. */
  pricePerKg: number;
}

/**
 * Represents the business information for the price list.
 */
export interface BusinessInfo {
  /** The name of the brand. */
  brandName: string;
  /** The contact phone number. */
  phone: string;
  /** The Instagram handle. */
  instagram: string;
  /** The Telegram handle. */
  telegram: string;
  /** The WhatsApp number. */
  whatsapp: string;
}

/**
 * Represents a single product in the price list.
 */
export interface Product {
  /** A unique identifier for the product. */
  id: string;
  /** The name of the product. */
  name: string;
  /** The price of the product. */
  price: string;
}

/**
 * Represents the list of products, categorized.
 */
export interface ProductList {
  /** A list of roasted coffee products. */
  coffee: Product[];
  /** A list of green bean products. */
  greenBean: Product[];
  /** A list of powdered products. */
  powders: Product[];
}

/**
 * Represents a single step in a brewing recipe.
 */
export interface BrewStep {
  time: number; // seconds from start
  description: string;
  waterAmount?: number; // cumulative water amount target
}

/**
 * Represents a complete brewing recipe.
 */
export interface BrewRecipe {
  id: string;
  title: string;
  method: 'V60' | 'Chemex' | 'Aeropress' | 'French Press' | 'Espresso' | 'Other';
  coffeeWeight: number; // grams
  waterWeight: number; // grams
  grindSize: string; // e.g., "Medium-Fine"
  temp: number; // Celsius
  steps: BrewStep[];
}