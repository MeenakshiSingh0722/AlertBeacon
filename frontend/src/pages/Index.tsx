import { Navigate } from "react-router-dom";
import Login from "./Login";
import { useAlerts } from "@/store/useAlerts";

export default function Index() {
  const { authed } = useAlerts();
  if (authed) return <Navigate to="/dashboard" replace />;
  return <Login />;
}
