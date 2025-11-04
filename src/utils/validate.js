function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const { fieldErrors, formErrors } = parsed.error.flatten();
    const errors = { ...fieldErrors };
    if (formErrors && formErrors.length) errors._form = formErrors;
    const err = new Error("Validation failed");
    err.status = 400;
    err.payload = { errors };
    throw err;
  }
  return parsed.data;
}
module.exports = { validate };
