import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/AuthProvider";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ModelInfo from "./pages/ModelInfo";
import FeaturesExplorer from "./pages/FeaturesExplorer";
import Settings from "./pages/settings";
import AlertBanner from "./components/AlertBanner";

function App() {
return (
<AuthProvider>
<BrowserRouter>
<AlertBanner />
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/*" element={
<ProtectedRoute>
<Layout>
<Routes>
<Route path="/" element={<Dashboard />} />
<Route path="/model" element={<ModelInfo />} />
<Route path="/features" element={<FeaturesExplorer />} />
<Route path="/settings" element={<Settings />} />
</Routes>
</Layout>
</ProtectedRoute>
} />
</Routes>
</BrowserRouter>
</AuthProvider>
);
}

export default App;