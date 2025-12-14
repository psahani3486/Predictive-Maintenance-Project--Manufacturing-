import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useAuthStore } from "../../stores/authStore";
import { useAlertStore } from "../../stores/alertStore";

const Login: React.FC = () => {
  const { control, handleSubmit } = useForm({
    defaultValues: { username: "", password: "" },
  });
  const login = useAuthStore((state) => state.login);
  const addAlert = useAlertStore((state) => state.addAlert);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { username: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (!success) {
        addAlert({
          type: "error",
          message: "Invalid credentials. Try admin/admin",
        });
      }
    } catch (err) {
      addAlert({
        type: "error",
        message: "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" gutterBottom align="center">
          Predictive Maintenance
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mb={3}>
          Login to access the dashboard
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField label="Username" {...field} required />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Password"
                  type="password"
                  {...field}
                  required
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </form>
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Demo credentials: admin / admin
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
