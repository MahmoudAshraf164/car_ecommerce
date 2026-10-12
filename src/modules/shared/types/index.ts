export type CategoryType = "cars" | "scooters" | "real_estate";
export * from "./database.types";


export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: "available" | "reserved" | "sold";
  images: string[];
  specs?: Record<string, string>;
  createdAt: string;
}

export interface Scooter {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: "available" | "reserved" | "sold";
  images: string[];
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  areaSqm: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  status: "available" | "reserved" | "sold";
  images: string[];
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interestType: CategoryType;
  itemId?: string;
  notes?: string;
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: string;
}
