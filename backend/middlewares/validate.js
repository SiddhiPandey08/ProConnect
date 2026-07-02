import Joi from "joi";

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // collect ALL errors, not just the first
    stripUnknown: true, // remove fields not in schema
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(422).json({ message: "Validation failed", errors });
  }

  req.body = value; // use the sanitized value
  next();
};

export default validate;
