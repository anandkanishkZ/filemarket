import Joi from 'joi';

export const createFileSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(1000),
  category_id: Joi.number().required(),
  price: Joi.number().min(0).when('is_free', {
    is: true,
    then: Joi.number().valid(0),
    otherwise: Joi.number().required()
  }),
  is_free: Joi.boolean().required()
});

export const updateFileSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(1000),
  category_id: Joi.number(),
  price: Joi.number().min(0).when('is_free', {
    is: true,
    then: Joi.number().valid(0),
    otherwise: Joi.number()
  }),
  is_free: Joi.boolean()
}).min(1); 