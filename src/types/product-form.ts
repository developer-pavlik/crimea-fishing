export type ProductCondition = "new" | "used";

export interface ProductSpecificationRow {
  name: string;
  value: string;
}

export interface ProductFormData {
  title: string;
  price: number;
  isFree: boolean;
  condition: ProductCondition;
  description: string;
  imagesUrl: string[];
  specifications: ProductSpecificationRow[];
}

export interface ProductInitialData extends ProductFormData {
  id?: string;
}
