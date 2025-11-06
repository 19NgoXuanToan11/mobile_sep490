
export type CreateFeedbackDTO = {
    comment: string;
    rating?: number | null;
    orderDetailId: number;
};
