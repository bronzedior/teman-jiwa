export type Role = "user" | "expert" | "admin";

export interface User {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    date_of_birth: string;
    role: Role;
    avatar?: string;
    specialization?: string;
}
