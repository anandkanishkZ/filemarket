import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  file_id: Joi.number().required(),
  payment_method_id: Joi.number().required()
});

export const createPaymentMethodSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  details: Joi.string().required(),
  instructions: Joi.string().required()
});

export const updatePaymentMethodSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string(),
  details: Joi.string(),
  instructions: Joi.string(),
  is_active: Joi.boolean()
});

export const verifyPaymentSchema = Joi.object({
  transaction_id: Joi.string().required(),
  status: Joi.string().valid('completed', 'failed', 'refunded').required(),
  notes: Joi.string().allow('')
}); 