import { Route, Routes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import Home from "@/pages/Home";
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

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/reading" element={<Reading />} />
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
