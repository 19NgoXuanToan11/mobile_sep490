
export type CreateProductDTO = {
    productName: string;
    price: number;
    images?: string | null;
    description?: string | null;
    categoryId: number;
    cropId: number;
};
