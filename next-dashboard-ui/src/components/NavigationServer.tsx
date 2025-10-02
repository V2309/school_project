import { getCurrentUser } from "@/hooks/auth";
import Navigation from "./Navigation";

export default async function NavigationServer() {
  const user = await getCurrentUser(); // chạy trên server
  return <Navigation initialUser={user} />;
}