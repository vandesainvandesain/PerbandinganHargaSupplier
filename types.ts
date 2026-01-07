export interface MasterItem {
  code: string;
  name: string;
  category: string;
  unit: string;
}

export interface SupplierPrice {
  itemCode: string;
  price: number;
  lastUpdated: string; // ISO Date string
}

export interface Supplier {
  id: string;
  name: string;
  prices: SupplierPrice[]; // List of items this supplier sells
}

export interface AppData {
  masterItems: MasterItem[];
  suppliers: Supplier[];
}

export type ViewMode = 'dashboard' | 'management';
export type ManagementTab = 'suppliers' | 'items' | 'importer';