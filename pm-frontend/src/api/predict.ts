import { api } from "./client";
import type { PredictInput, PredictResponse } from "../types";
export async function predictOne(payload: PredictInput): Promise<PredictResponse> {
const resp = await api.post("/predict", payload);
return resp.data as PredictResponse;
}