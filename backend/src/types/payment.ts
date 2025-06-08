export interface Payment {
  id: number;
  user_id: number;
  file_id: number;
  payment_method_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_details: string;
  payment_instructions: string;
  admin_notes?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
  file_title?: string;
  payment_method_name?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  details: string;
  instructions: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
} 