
import type { Gender } from './Gender';
export type AccountForm = {
    email: string;
    gender: Gender;
    role: number;
    phone: string;
    fullname: string;
    address: string;
    images?: string | null;
};
