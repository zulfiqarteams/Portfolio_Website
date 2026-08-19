import type { AppLanguage } from "@/features/settings";

export const languageOptions: Array<{ id: AppLanguage; label: string }> = [
  { id: "ur", label: "اردو" },
  { id: "en", label: "English" },
  { id: "roman", label: "Roman Urdu" },
];

export const navigationLabels: Record<AppLanguage, Record<string, string>> = {
  ur: { Home: "صفحۂ اول", Practice: "مشق", Tests: "ٹیسٹ", Progress: "پیش رفت", Profile: "پروفائل", Settings: "ترتیبات", "Start Learning": "سیکھنا شروع کریں", "Create Profile": "پروفائل بنائیں" },
  en: { Home: "Home", Practice: "Practice", Tests: "Tests", Progress: "Progress", Profile: "Profile", Settings: "Settings", "Start Learning": "Start Learning", "Create Profile": "Create Profile" },
  roman: { Home: "Home", Practice: "Mashq", Tests: "Tests", Progress: "Peshraft", Profile: "Profile", Settings: "Tarteebat", "Start Learning": "Seekhna Shuru Karein", "Create Profile": "Profile Banayein" },
};

export const homeContent = {
  ur: {
    badge: "فونٹک کی بورڈ · ابتدائی سے ماہر تک",
    welcomeBack: "خوش آمدید",
    gettingStarted: "آغاز کریں",
    welcomeName: (name: string) => `خوش آمدید، ${name}`,
    heroTitle: "اردو ٹائپنگ سیکھیں، ایک آواز سے ایک قدم تک۔",
    heroDescription: "PAKURDU ایک سادہ اور قابلِ اعتماد پلیٹ فارم ہے جہاں آپ اردو فونٹک کی بورڈ کو شروع سے سیکھ سکتے ہیں، مشق کر سکتے ہیں اور اپنی رفتار بہتر بنا سکتے ہیں۔",
    startLearning: "سیکھنا شروع کریں",
    learningPath: "سیکھنے کا راستہ دیکھیں",
    continueLearning: "سیکھنا جاری رکھیں",
    continueWith: "جاری رکھیں:",
    courseProgress: "کورس کی پیش رفت",
    completed: "مکمل اسباق",
    bestWpm: "بہترین WPM",
    bestAccuracy: "بہترین درستگی",
    progress: "کورس کی پیش رفت",
    whatsAhead: "آگے کیا ہے",
    sectionTitle: "اردو ٹائپنگ سیکھنے کے لیے ضروری سب کچھ",
    sectionDescription: "سبق، رہنمائی اور مشق کے ذریعے اپنی اردو ٹائپنگ کی بنیاد مضبوط کریں۔",
    features: [
      ["اردو ٹائپنگ سیکھیں", "فونٹک کی بورڈ کو بنیادی حروف سے الفاظ اور مکمل جملوں تک مرحلہ وار سمجھیں۔"],
      ["مشق کریں", "اپنی موجودہ سطح کے مطابق رہنمائی شدہ مشقوں سے انگلیوں کی یادداشت مضبوط کریں۔"],
      ["پیش رفت دیکھیں", "رفتار، درستگی اور مکمل کیے گئے اسباق کی پیش رفت ایک جگہ دیکھیں۔"],
      ["ٹائپنگ ٹیسٹ دیں", "حقیقی اردو ٹائپنگ رفتار اور درستگی کو وقت کے ساتھ جانچیں۔"],
    ],
    philosophy: "سیکھیں، مشق کریں، بہتر بنیں",
    steps: [["سیکھیں", "ہر آواز کی فونٹک کی بورڈ پر جگہ سمجھیں۔"], ["مشق کریں", "رہنمائی شدہ مشقوں کو دہرائیں تاکہ کلیدیں مانوس ہو جائیں۔"], ["بہتر بنیں", "ٹیسٹ دے کر حقیقی پیش رفت ناپیں اور رفتار بڑھائیں۔"]],
  },
  en: {
    badge: "Phonetic keyboard · Beginner to professional",
    welcomeBack: "Welcome back", gettingStarted: "Getting started", welcomeName: (name: string) => `Welcome back, ${name}`,
    heroTitle: "Learn Urdu typing, one sound at a time.",
    heroDescription: "PAKURDU is a simple, reliable platform for learning the Urdu phonetic keyboard from the ground up, building accuracy, and improving speed.",
    startLearning: "Start Learning", learningPath: "View Learning Path", continueLearning: "Continue Learning", continueWith: "Continue with:", courseProgress: "Course progress", completed: "Completed", bestWpm: "Best WPM", bestAccuracy: "Best Accuracy", progress: "Course Progress",
    whatsAhead: "What's ahead", sectionTitle: "Everything you need to learn Urdu typing", sectionDescription: "Build a strong Urdu typing foundation through structured lessons, guidance, and focused practice.",
    features: [["Learn Urdu Typing", "Learn the phonetic keyboard step by step, from basic characters to words and complete sentences."], ["Practice", "Build muscle memory with guided exercises matched to your current level."], ["Track Progress", "See your speed, accuracy, and completed lessons improve in one place."], ["Take Typing Tests", "Measure your real-world Urdu typing speed and accuracy with timed tests."]],
    philosophy: "Learn, practice, improve", steps: [["Learn", "Understand where each sound sits on the phonetic keyboard."], ["Practice", "Repeat guided exercises until the keys feel familiar."], ["Improve", "Measure real progress with tests and build speed."]],
  },
  roman: {
    badge: "Phonetic keyboard · Beginner se professional tak", welcomeBack: "Khush aamdeed", gettingStarted: "Shuruat", welcomeName: (name: string) => `Khush aamdeed, ${name}`,
    heroTitle: "Urdu typing seekhein, har awaaz ke saath ek qadam.",
    heroDescription: "PAKURDU ek simple aur reliable platform hai jahan aap Urdu phonetic keyboard ko bilkul shuru se seekh kar accuracy aur speed behtar kar sakte hain.",
    startLearning: "Seekhna Shuru Karein", learningPath: "Learning Path Dekhein", continueLearning: "Seekhna Jari Rakhein", continueWith: "Yahan se jari rakhein:", courseProgress: "Course ki peshraft", completed: "Mukammal sabaq", bestWpm: "Behtareen WPM", bestAccuracy: "Behtareen accuracy", progress: "Course ki peshraft",
    whatsAhead: "Aagay kya hai", sectionTitle: "Urdu typing seekhne ke liye zaroori sab kuch", sectionDescription: "Structured lessons, rehnumai aur focused practice ke zariye apni Urdu typing ki bunyaad mazboot karein.",
    features: [["Urdu Typing Seekhein", "Phonetic keyboard ko basic characters se words aur mukammal jumlon tak step by step seekhein."], ["Mashq Karein", "Apni level ke mutabiq guided exercises se finger memory mazboot karein."], ["Peshraft Dekhein", "Speed, accuracy aur completed lessons ki peshraft ek jagah dekhein."], ["Typing Tests Dein", "Timed tests ke zariye apni real Urdu typing speed aur accuracy check karein."]],
    philosophy: "Seekhein, mashq karein, behtar banein", steps: [["Seekhein", "Har awaaz ki phonetic keyboard par jagah samjhein."], ["Mashq Karein", "Guided exercises ko repeat karein taa-ke keys familiar ho jayein."], ["Behtar Banein", "Tests se apni real peshraft naap kar speed barhayein."]],
  },
} as const;
