import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  bio: Joi.string().max(300).allow(""),
}).min(1);
