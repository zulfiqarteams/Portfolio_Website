import { Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import Learn from "@/pages/Learn";
import Reading from "@/pages/Reading";
import LessonDetail from "@/pages/LessonDetail";
import Practice from "@/pages/Practice";
import Test from "@/pages/Test";
import Results from "@/pages/Results";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import SahiUrdu from "@/features/sahiUrdu/components/SahiUrdu";
import Biography from "@/features/biography/components/Biography";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Main home page (/) par ab direct Practice page show hoga */}
        <Route path="/" element={<Practice />} />
        
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/phonetic-keyboard" element={<Reading />} />
        <Route path="/learn/reading" element={<Navigate to="/learn/phonetic-keyboard" replace />} />
        <Route path="/sahi-urdu/*" element={<SahiUrdu />} />
        <Route path="/biography/*" element={<Biography />} />
        <Route path="/lesson/:id" element={<LessonDetail />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/test" element={<Test />} />
        <Route path="/results" element={<Results />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
