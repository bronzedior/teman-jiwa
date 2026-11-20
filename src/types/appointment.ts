export interface Appointment {
    id: string;
    expert_id: string;
    user_id: string;
    status: string;
    start_time: string;
    finished_time: string | null;
}
