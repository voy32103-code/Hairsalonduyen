export interface Appointment {
    id: string;
    customer_name: string;
    phone?: string;
    service_name: string;
    appointment_time: string;
    staff_name: string | null;
    status: string;
    price: number;
}

export interface AppointmentStats {
    total_today: number;
    completed_today: number;
    upcoming: number;
}
