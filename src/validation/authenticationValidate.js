import Joi from "joi";

const signupValidate = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[A-Z])[a-zA-Z0-9]{8,30}$/)
    .message(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one number"
    ),
}).options({ abortEarly: false });

const signinValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options({ abortEarly: false });

export { signupValidate, signinValidate };
