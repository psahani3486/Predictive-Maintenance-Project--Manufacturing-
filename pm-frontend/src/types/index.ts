export type PredictInput = {
features?: Record<string, number>;
id?: string;
sensors?: Record<string, number>;
} & Record<string, any>; // allow flat object too
export type PredictResponse = {
failure_probability?: number;
error?: string;
};

export type BatchResult = {
input: any;
resp: PredictResponse;
};

export type PredictionRecord = {
id: string;
input: PredictInput;
result?: PredictResponse;
timestamp: string;
};

export type User = {
id: string;
username: string;
};

export type Alert = {
id: string;
type: "success" | "error" | "warning" | "info";
message: string;
timestamp: number;
};
