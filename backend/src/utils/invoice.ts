import { Payment } from '../types/payment';

export const generateInvoice = async (payment: Payment) => {
  // Generate a unique invoice number
  const invoiceNumber = `INV-${payment.id}-${Date.now().toString().slice(-6)}`;

  // Format the date
  const date = new Date(payment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create invoice object
  const invoice = {
    invoice_number: invoiceNumber,
    date,
    customer: {
      name: payment.user_name,
      email: payment.user_email
    },
    items: [
      {
        description: payment.file_title,
        amount: payment.amount
      }
    ],
    payment_method: payment.payment_method_name,
    status: payment.status,
    total: payment.amount,
    transaction_id: payment.transaction_id || 'Pending',
    notes: payment.admin_notes || ''
  };

  return invoice;
}; 