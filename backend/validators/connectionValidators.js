import Joi from "joi";

export const sendConnectionSchema = Joi.object({
  targetUserId: Joi.string().required(),
});
