import { Outlet } from "react-router-dom";
import { Navbar } from "@/layouts/Navbar";
import { Footer } from "@/layouts/Footer";
import { useLanguage } from "@/i18n/useLanguage";
import { installGlobalLocalization } from "@/i18n/globalLocalization";
import { useEffect } from "react";

export function RootLayout() {
  const { language, direction } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language === "ur" ? "ur" : language === "roman" ? "en" : "en";
    document.documentElement.dir = direction;
    const observer = installGlobalLocalization(language);
    return () => observer.disconnect();
  }, [language, direction]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
