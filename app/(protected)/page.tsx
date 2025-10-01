import { redirect } from "next/navigation";

// Legacy protected route - redirect to new structure
export default function LegacyHomePage() {
  redirect("/default/concorrente");
}
