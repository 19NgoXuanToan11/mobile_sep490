
import type { SelectProductDTO } from './SelectProductDTO';
export type CreateOrderDTO = {
    orderItems?: Array<SelectProductDTO> | null;
    shippingAddress?: string | null;
};
