
export type ScheduleRequest = {
    startDate: string;
    endDate: string;
    assignedTo: number;
    farmActivityId: Array<number>;
    farmDetailsId: number;
    cropId: number;
    plantingDate: string;
    location?: string | null;
    quantity: number;
};
