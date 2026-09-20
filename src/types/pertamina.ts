export interface PertaminaPriceItem {
  price: string | number;
  product: string;
  updatedDate: string;
}

export interface PertaminaProvinceItem {
  list_price: PertaminaPriceItem[];
  province: string;
}

export interface PertaminaApiResponse {
  data?: {
    data?: PertaminaProvinceItem[];
  };
}
