const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/app-error");

const validateRequest = (schema, location = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[location]);

  if (!result.success) {
    return next(
      new AppError("Validation failed", StatusCodes.BAD_REQUEST, {
        fields: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }),
    );
  }

  req[location] = result.data;
  return next();
};

module.exports = { validateRequest };
