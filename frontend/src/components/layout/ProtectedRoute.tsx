import { Navigate } from "react-router-dom";
import { useAlertBeaconStore } from "@/store/useAlertBeaconStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  // For now, bypass authentication to show the UI
  // TODO: Implement proper authentication check
  return children;
}
