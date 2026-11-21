export type InstallmentStatus = 'active' | 'completed' | 'overdue' | 'paused';
export type ReminderType = '2_days_before' | 'overdue' | 'custom';

export interface InstallmentRow {
  id: string;
  customer_id: string;
  car_id: string | null;
  lead_id: string | null;
  contract_title: string;
  total_amount: number;
  down_payment: number;
  paid_amount: number;
  monthly_amount: number;
  total_installments: number;
  paid_installments: number;
  due_day_of_month: number;
  start_date: string;
  next_due_date: string;
  status: InstallmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPaymentRow {
  id: string;
  installment_id: string;
  amount: number;
  payment_date: string;
  installment_number: number | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface InstallmentReminderRow {
  id: string;
  installment_id: string;
  target_due_date: string;
  reminder_type: string;
  sent_in_app: boolean;
  sent_email: boolean;
  recipient_email: string | null;
  created_at: string;
}

export interface InstallmentWithRelations extends InstallmentRow {
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  car?: {
    id: string;
    title: string;
    price?: number | null;
    car_images?: { image_url: string; is_primary: boolean }[];
  } | null;
  installment_payments?: InstallmentPaymentRow[];
}
