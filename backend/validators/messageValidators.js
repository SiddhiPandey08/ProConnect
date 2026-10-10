import Joi from "joi";

export const sendMessageSchema = Joi.object({
  content: Joi.string().trim().max(2000).required(),
});
