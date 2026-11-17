export type ProductCondition = "new" | "used";

export interface ProductSpecificationRow {
  name: string;
  value: string;
}

export interface ProductDeliveryMethods {
  pickup: boolean;
  carrier: boolean;
}

export interface ProductFormData {
  deliveryMethods: ProductDeliveryMethods;
  title: string;
  price: number;
  isFree: boolean;
  condition: ProductCondition;
  description: string;
  imagesUrl: string[];
  specifications: ProductSpecificationRow[];
}

export interface ProductInitialData extends Omit<ProductFormData, "deliveryMethods"> {
  deliveryMethods?: ProductDeliveryMethods;
  id?: string;
}
