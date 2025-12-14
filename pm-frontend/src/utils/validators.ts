import * as yup from "yup";

/**
 * Example validators for small forms.
 * Use react-hook-form + @hookform/resolvers/yup to wire these in forms.
 */

export const sensorsSchema = yup.object().shape({
  sensor_1: yup.number().required().min(0),
  sensor_2: yup.number().required().min(0),
  sensor_3: yup.number().required().min(0),
  // add other sensors dynamically as needed
});

export function validateSensors(obj: Record<string, any>) {
  try {
    sensorsSchema.validateSync(obj, { abortEarly: false });
    return { valid: true, errors: null as null | Record<string, string> };
  } catch (err: any) {
    const out: Record<string, string> = {};
    if (err.inner && Array.isArray(err.inner)) {
      err.inner.forEach((e: any) => {
        if (e.path) out[e.path] = e.message;
      });
    }
    return { valid: false, errors: out };
  }
}