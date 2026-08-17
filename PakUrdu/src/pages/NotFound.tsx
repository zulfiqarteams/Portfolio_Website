import { CompassIcon } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function NotFound() {
  return (
    <PlaceholderPage
      icon={CompassIcon}
      pageName="Page not found"
      routePath="404"
      description="The page you're looking for doesn't exist. Use the navigation above to get back on track."
    />
  );
}
