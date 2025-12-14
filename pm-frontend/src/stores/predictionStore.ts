import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PredictionRecord } from "../types";

interface PredictionState {
  history: PredictionRecord[];
  addPrediction: (record: PredictionRecord) => void;
  clearHistory: () => void;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      history: [],
      addPrediction: (record: PredictionRecord) =>
        set((state: PredictionState) => ({ history: [record, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "pm-prediction-history",
    }
  )
);
