import Joi from "joi";

export const updateProfileSchema = Joi.object({
  token: Joi.string().required(),

  name: Joi.string().trim().min(2).max(50),
  bio: Joi.string().max(300).allow(""),
  currentPosition: Joi.string().allow(""),

  education: Joi.array().items(
    Joi.object({
      school: Joi.string().allow("", null),
      degree: Joi.string().allow("", null),
      fieldOfStudy: Joi.string().allow("", null),
    }),
  ),

  pastWork: Joi.array().items(
    Joi.object({
      company: Joi.string().allow("", null),
      position: Joi.string().allow("", null),
      startMonth: Joi.string().allow("", null),
      startYear: Joi.number().allow(null),
      endMonth: Joi.string().allow("", null),
      endYear: Joi.number().allow(null),
      current: Joi.boolean(),
    }),
  ),
}).min(1);

export const updateUserProfileSchema = Joi.object({
  token: Joi.string().required(),
  username: Joi.string().trim().min(3).max(30),
  email: Joi.string().email(),
}).min(1);
