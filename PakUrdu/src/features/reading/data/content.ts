export type ReadingLanguage = "ur" | "en" | "roman";

export interface ReadingSection {
  id: string;
  title: Record<ReadingLanguage, string>;
  explanation: Record<ReadingLanguage, string>;
  points: Record<ReadingLanguage, string[]>;
  example?: {
    urdu: string;
    en: string;
    roman: string;
  };
  practice: Record<ReadingLanguage, string>;
}

export const readingSections: ReadingSection[] = [
  {
    id: "introduction",
    title: { ur: "اردو ٹائپنگ کا تعارف", en: "Introduction to Urdu Typing", roman: "Urdu Typing ka Taaruf" },
    explanation: {
      ur: "اردو ٹائپنگ کا مطلب کمپیوٹر یا موبائل کی بورڈ سے درست، تیز اور مسلسل اردو لکھنا ہے۔ اس کورس میں آپ صوتی کی بورڈ کے ذریعے انگریزی حروف والی عام کی بورڈ کو اردو لکھنے کے لیے استعمال کریں گے۔",
      en: "Urdu typing means producing clear, accurate Urdu text with a computer or mobile keyboard. In this course you use a phonetic keyboard, so familiar English keys are connected to Urdu sounds and characters.",
      roman: "Urdu typing ka matlab computer ya mobile keyboard se saaf, durust aur lagataar Urdu likhna hai. Is course mein phonetic keyboard istemal hota hai jahan English keys ko Urdu ki awaazon aur huruf se jora jata hai.",
    },
    points: {
      ur: ["رفتار سے پہلے درستگی کو ترجیح دیں۔", "ہر نئے حرف کو کی بورڈ کی اصل جگہ کے ساتھ یاد کریں۔", "روزانہ مختصر مگر باقاعدہ مشق کریں۔", "غلطی کی وجہ سمجھ کر دوبارہ ٹائپ کریں۔"],
      en: ["Prioritize accuracy before speed.", "Learn every new character together with its physical key.", "Practice briefly but consistently each day.", "Review the cause of mistakes instead of only repeating the word."],
      roman: ["Speed se pehle accuracy ko tarjeeh dein.", "Har naye harf ko us ki physical key ke saath yaad karein.", "Roz thori magar baqaidgi se practice karein.", "Ghalti ki wajah samajh kar dobara type karein."],
    },
    practice: {
      ur: "آج صرف 5 منٹ میں کی بورڈ دیکھے بغیر چند بنیادی حروف ٹائپ کریں اور اپنی درستگی نوٹ کریں۔",
      en: "Spend five minutes typing a few basic characters without staring at the keyboard, then note your accuracy.",
      roman: "Aaj paanch minute kuch basic huruf keyboard ko dekhe baghair type karein aur accuracy note karein.",
    },
  },
  {
    id: "fundamentals",
    title: { ur: "کی بورڈ کی بنیادی سمجھ", en: "Keyboard Fundamentals", roman: "Keyboard ki Bunyadi Samajh" },
    explanation: {
      ur: "اس منصوبے میں QWERTY کی بورڈ کی عام قطاریں استعمال ہوتی ہیں۔ ہر انگریزی key کے ساتھ ایک اردو حرف منسلک ہے، جبکہ بعض حروف Shift کے ساتھ حاصل ہوتے ہیں۔",
      en: "The project uses the familiar QWERTY keyboard rows. Each mapped English key produces an Urdu character, while some related characters are produced with Shift.",
      roman: "Is project mein mashhoor QWERTY keyboard ki rows istemal hoti hain. Har mapped English key ek Urdu harf deti hai aur kuch mutalliq huruf Shift ke saath milte hain.",
    },
    points: {
      ur: ["QWERTY کی اوپری، ہوم اور نچلی row پہچانیں۔", "Spacebar الفاظ کے درمیان خلا کے لیے استعمال ہوتی ہے۔", "Shift والے حروف کے لیے key کے ساتھ Shift دبائیں۔", "Backspace آخری ٹائپ شدہ حرف واپس لیتا ہے۔"],
      en: ["Recognize the top, home and bottom QWERTY rows.", "Use Spacebar to separate words.", "Hold Shift for mapped alternate characters.", "Use Backspace to remove the most recent character."],
      roman: ["QWERTY ki top, home aur bottom rows pehchanain.", "Words ke darmiyan space ke liye Spacebar use karein.", "Alternate characters ke liye Shift ke saath key dabayen.", "Aakhri character hatane ke liye Backspace use karein."],
    },
    example: { urdu: "ب  س  م  ا", en: "b  s  m  a", roman: "b  s  m  a" },
    practice: {
      ur: "اوپر کی تین rows کو دیکھ کر a, s, d, f اور j, k, l کی جگہیں تلاش کریں۔ پھر انہیں آہستہ آہستہ دبائیں۔",
      en: "Locate a, s, d, f and j, k, l on the keyboard without moving your hands around. Press them slowly and deliberately.",
      roman: "Keyboard par a, s, d, f aur j, k, l ki jagah dhoondhein aur haath idhar udhar kiye baghair ahista dabayen.",
    },
  },
  {
    id: "layout",
    title: { ur: "اردو کی بورڈ لے آؤٹ", en: "Urdu Keyboard Layout", roman: "Urdu Keyboard Layout" },
    explanation: {
      ur: "اس ٹیوٹوریل کا صوتی نقشہ آواز کے قریب حروف کو عام QWERTY keys سے جوڑتا ہے۔ مثال کے طور پر b سے ب، m سے م اور s سے س حاصل ہوتا ہے۔",
      en: "This tutorial's phonetic map connects familiar QWERTY keys to Urdu characters by sound. For example, b produces ب, m produces م, and s produces س.",
      roman: "Is tutorial ka phonetic map qareebi awaaz walay Urdu huruf ko QWERTY keys se jorta hai. Misal ke taur par b se ب, m se م aur s se س milta hai.",
    },
    points: {
      ur: ["a → ا", "b → ب", "m → م", "s → س", "k → ک اور Shift+k → خ", "h → ہ اور Shift+h → ھ"],
      en: ["a → ا", "b → ب", "m → م", "s → س", "k → ک and Shift+k → خ", "h → ہ and Shift+h → ھ"],
      roman: ["a → ا", "b → ب", "m → م", "s → س", "k → ک aur Shift+k → خ", "h → ہ aur Shift+h → ھ"],
    },
    practice: {
      ur: "اپنی اگلی مشق میں ہر حرف کے لیے پہلے اردو حرف دیکھیں، پھر متعلقہ physical key تلاش کریں، پھر انگلی کی جگہ محسوس کریں۔",
      en: "For each new character, look at the Urdu character first, identify its physical key, then place the correct finger before pressing it.",
      roman: "Har naye harf ke liye pehle Urdu harf dekhein, phir physical key aur us ke baad sahi finger ki position mehsoos karein.",
    },
  },
  {
    id: "characters",
    title: { ur: "بنیادی اردو حروف", en: "Basic Urdu Characters", roman: "Bunyadi Urdu Huruf" },
    explanation: {
      ur: "حروف کو الگ الگ یاد کرنے کے بجائے انہیں key، آواز اور مثال کے ساتھ یاد کریں۔ اس سے شناخت اور muscle memory دونوں بہتر ہوتی ہیں۔",
      en: "Learn characters together with their key, sound and an example. This builds both recognition and muscle memory.",
      roman: "Huruf ko sirf alag alag yaad na karein; unhein key, awaaz aur misaal ke saath seekhein. Is se recognition aur muscle memory dono behtar hoti hain.",
    },
    points: {
      ur: ["ب = b، پ = p، ت = t", "د = d، ر = r، س = s", "م = m، ن = n، ل = l", "و = o، ی = e، ے = y"],
      en: ["ب = b, پ = p, ت = t", "د = d, ر = r, س = s", "م = m, ن = n, ل = l", "و = o, ی = e, ے = y"],
      roman: ["ب = b, پ = p, ت = t", "د = d, ر = r, س = s", "م = m, ن = n, ل = l", "و = o, ی = e, ے = y"],
    },
    example: { urdu: "ب  پ  ت  د  ر  س  م  ن", en: "b  p  t  d  r  s  m  n", roman: "b  p  t  d  r  s  m  n" },
    practice: {
      ur: "ایک وقت میں 4 سے 6 حروف لیں۔ ہر حرف کو تین مرتبہ آہستہ ٹائپ کریں، پھر انہیں ملا کر چھوٹا sequence لکھیں۔",
      en: "Work with four to six characters at a time. Type each three times slowly, then combine them into a short sequence.",
      roman: "Ek waqt mein 4 se 6 huruf lein. Har harf ko teen martaba ahista type karein, phir unhein mila kar chhota sequence likhein.",
    },
  },
  {
    id: "shift",
    title: { ur: "Shift اور متبادل حروف", en: "Shift and Alternate Characters", roman: "Shift aur Alternate Huruf" },
    explanation: {
      ur: "کچھ متعلقہ اردو حروف ایک ہی physical key کے Shift ورژن سے حاصل ہوتے ہیں۔ اس لیے key کی جگہ کے ساتھ یہ بھی یاد رکھیں کہ Shift کب استعمال کرنا ہے۔",
      en: "Some related Urdu characters share a physical key and use Shift as the alternate form. Memorize both the key location and whether Shift is required.",
      roman: "Kuch mutalliq Urdu huruf aik hi physical key ke Shift version se milte hain. Is liye key ki jagah ke saath yeh bhi yaad rakhein ke Shift kab use karna hai.",
    },
    points: {
      ur: ["k → ک، Shift+k → خ", "s → س، Shift+s → ش", "t → ت، Shift+t → ط", "a → ا، Shift+a → آ", "z → ز، Shift+z → ص"],
      en: ["k → ک, Shift+k → خ", "s → س, Shift+s → ش", "t → ت, Shift+t → ط", "a → ا, Shift+a → آ", "z → ز, Shift+z → ص"],
      roman: ["k → ک, Shift+k → خ", "s → س, Shift+s → ش", "t → ت, Shift+t → ط", "a → ا, Shift+a → آ", "z → ز, Shift+z → ص"],
    },
    practice: {
      ur: "پہلے بغیر Shift والے حروف کی جوڑی ٹائپ کریں، پھر اسی key کو Shift کے ساتھ آزمائیں۔ ہاتھ کی پوزیشن تبدیل نہ کریں۔",
      en: "Type each base character first, then try its Shift variant on the same key. Keep your hand position stable.",
      roman: "Pehle base character type karein, phir usi key ka Shift variant azmaein. Haath ki position na badlein.",
    },
  },
  {
    id: "combinations",
    title: { ur: "حروف کو جوڑنا", en: "Character Combinations", roman: "Huruf ko Jorna" },
    explanation: {
      ur: "اردو کے الفاظ کئی حروف کے مسلسل امتزاج سے بنتے ہیں۔ typing میں اصل مقصد ہر حرف کو الگ دیکھنے کے بجائے آہستہ آہستہ مکمل لفظ کے pattern کو پہچاننا ہے۔",
      en: "Urdu words are built from sequences of characters. The goal is to move from identifying every letter separately to recognizing the pattern of a whole word.",
      roman: "Urdu ke alfaaz musalsal huruf ke combinations se bante hain. Maqsad yeh hai ke har harf ko alag dekhne ke bajaye dheere dheere poore lafz ka pattern pehchana jaye.",
    },
    points: {
      ur: ["ہر حرف کے بعد cursor کی اگلی جگہ دیکھیں۔", "مشکل جوڑ کو چھوٹے حصوں میں تقسیم کریں۔", "غلطی ہونے پر رفتار کم کریں، ہاتھ نہ گھمائیں۔", "بار بار آنے والے patterns کو muscle memory میں شامل کریں۔"],
      en: ["Watch the next cursor position after each character.", "Break difficult combinations into smaller chunks.", "Slow down after an error instead of moving your hands.", "Turn repeated patterns into muscle memory."],
      roman: ["Har harf ke baad next cursor position dekhein.", "Mushkil combination ko chhote parts mein divide karein.", "Ghalti ke baad speed kam karein, haath na ghumayen.", "Bar bar aane wale patterns ko muscle memory mein laayein."],
    },
    example: { urdu: "سلام  کتاب  پاکستان", en: "salaam  kitaab  Pakistan", roman: "salaam  kitaab  Pakistan" },
    practice: {
      ur: "ایک لفظ کو پہلے حرف بہ حرف ٹائپ کریں، پھر اسی لفظ کو دوبارہ تھوڑا تیز لکھیں۔ دونوں کوششوں میں غلطیاں گنیں۔",
      en: "Type one word character by character, then repeat it slightly faster. Compare the number of mistakes.",
      roman: "Ek lafz pehle harf ba harf type karein, phir usi lafz ko thora tez likhein. Dono attempts ki ghaltiyan compare karein.",
    },
  },
  {
    id: "words",
    title: { ur: "الفاظ کی مشق", en: "Urdu Words", roman: "Urdu Alfaaz" },
    explanation: {
      ur: "الفاظ کی مشق میں مقصد صرف صحیح spelling نہیں بلکہ مستقل rhythm پیدا کرنا ہے۔ عام اور مختصر الفاظ سے شروع کریں، پھر لمبے الفاظ کی طرف جائیں۔",
      en: "Word practice is about more than spelling. Build a steady rhythm with common short words first, then move toward longer words.",
      roman: "Words ki practice sirf spelling ke liye nahi hoti. Pehle aam chhote alfaaz se steady rhythm banayein, phir lambe alfaaz ki taraf jayein.",
    },
    points: {
      ur: ["دو سے چار حرف والے الفاظ سے آغاز کریں۔", "ہر لفظ کے بعد Spacebar دبانے کی عادت بنائیں۔", "ہر لفظ کے آغاز میں دوبارہ home position پر آئیں۔", "مشکل لفظ کو حصوں میں توڑ کر مشق کریں۔"],
      en: ["Start with two-to-four-character words.", "Build the habit of pressing Spacebar after each word.", "Return to a stable home position before the next word.", "Split difficult words into smaller parts."],
      roman: ["Do se chaar harf ke alfaaz se shuru karein.", "Har lafz ke baad Spacebar dabane ki aadat banayein.", "Agla lafz shuru karne se pehle home position par aayein.", "Mushkil lafz ko chhote parts mein tod kar practice karein."],
    },
    example: { urdu: "گھر  پانی  کتاب  دوست", en: "home  water  book  friend", roman: "ghar  pani  kitaab  dost" },
    practice: {
      ur: "پانچ عام الفاظ منتخب کریں اور ہر لفظ کو تین مرتبہ ٹائپ کریں۔ صرف آخری کوشش میں رفتار بڑھائیں۔",
      en: "Choose five common words and type each three times. Increase speed only on the final repetition.",
      roman: "Paanch aam alfaaz chun kar har lafz teen martaba type karein. Sirf aakhri repetition mein speed barhayein.",
    },
  },
  {
    id: "sentences",
    title: { ur: "اردو جملے", en: "Urdu Sentences", roman: "Urdu Jumlay" },
    explanation: {
      ur: "جملوں میں typing کے دوران الفاظ، spaces اور punctuation ایک ساتھ سنبھالنا پڑتا ہے۔ اس مرحلے پر مسلسل flow accuracy جتنا ہی اہم ہو جاتا ہے۔",
      en: "Sentences require you to manage words, spaces and punctuation together. At this stage, a steady flow becomes as important as accuracy.",
      roman: "Jumlon mein words, spaces aur punctuation ko aik saath handle karna hota hai. Is stage par steady flow accuracy jitna hi aham ho jata hai.",
    },
    points: {
      ur: ["ہر لفظ کے بعد ایک space رکھیں۔", "punctuation کے فوراً بعد cursor کو اگلی جگہ پر لے جائیں۔", "جملے کو مکمل طور پر دیکھ کر rhythm بنائیں۔", "ہر غلطی پر رکنے کے بجائے exercise ختم ہونے کے بعد review کریں۔"],
      en: ["Use one space between words.", "Move smoothly after punctuation.", "Look ahead across the sentence to build rhythm.", "When appropriate, review mistakes after finishing rather than stopping after every error."],
      roman: ["Har lafz ke darmiyan aik space rakhein.", "Punctuation ke baad smoothly agay barhein.", "Poore jumlay ko dekh kar rhythm banayein.", "Har ghalti par rukne ke bajaye exercise ke baad review karein."],
    },
    example: { urdu: "میں روز اردو ٹائپ کرنے کی مشق کرتا ہوں۔", en: "I practice typing Urdu every day.", roman: "Main roz Urdu type karne ki mashq karta hoon." },
    practice: {
      ur: "ایک مختصر جملہ پہلے 100٪ درستگی کے مقصد سے ٹائپ کریں، پھر اسی جملے کو بغیر رکے دوبارہ ٹائپ کریں۔",
      en: "Type one short sentence with an accuracy-first goal, then repeat it without stopping to build flow.",
      roman: "Aik chhota jumla pehle accuracy-first maqsad ke saath type karein, phir baghair rukay dobara type karein.",
    },
  },
  {
    id: "accuracy",
    title: { ur: "درستگی کی تربیت", en: "Accuracy Training", roman: "Durustgi ki Training" },
    explanation: {
      ur: "تیز مگر غلط typing فائدہ مند نہیں۔ Accuracy بہتر کرنے کے لیے غلطیوں کی قسم پہچانیں: غلط key، غلط Shift، missing space یا جلدی میں ہاتھ کی حرکت۔",
      en: "Fast typing with frequent errors is not useful. Identify whether each mistake came from the wrong key, wrong Shift state, a missing space, or rushed hand movement.",
      roman: "Tez magar ghalat typing faida mand nahi. Dekhein ghalti wrong key, wrong Shift, missing space ya jaldi mein hand movement ki wajah se hui.",
    },
    points: {
      ur: ["روزانہ ایک مختصر accuracy drill کریں۔", "غلطی کے فوراً بعد speed کم کریں۔", "مشکل key کو الگ سے repeat کریں۔", "Accuracy 95٪ سے کم ہو تو speed بڑھانے سے پہلے غلطیاں کم کریں۔"],
      en: ["Do a short accuracy drill each day.", "Slow down immediately after a recurring mistake.", "Repeat difficult keys separately.", "If accuracy is below 95%, reduce errors before chasing higher speed."],
      roman: ["Roz aik chhoti accuracy drill karein.", "Bar bar hone wali ghalti ke baad speed kam karein.", "Mushkil key ko alag repeat karein.", "Agar accuracy 95% se kam ho to speed se pehle errors kam karein."],
    },
    practice: {
      ur: "دو منٹ کی مشق میں ہر غلط حرف کو نوٹ کریں۔ آخر میں صرف ان keys کی targeted practice کریں۔",
      en: "During a two-minute drill, note every recurring wrong character. Finish with targeted practice on those keys.",
      roman: "Do minute ki drill mein bar bar hone wale ghalat huruf note karein. Aakhir mein unhi keys ki targeted practice karein.",
    },
  },
  {
    id: "speed",
    title: { ur: "رفتار اور WPM", en: "Speed and WPM", roman: "Raftaar aur WPM" },
    explanation: {
      ur: "WPM یعنی Words Per Minute typing speed کا ایک عام پیمانہ ہے۔ اس منصوبے میں 5 typed characters کو ایک word کے برابر شمار کیا جاتا ہے۔",
      en: "WPM, or Words Per Minute, is a common measure of typing speed. This project uses the standard convention of five typed characters per word.",
      roman: "WPM yani Words Per Minute typing speed ka aam paimana hai. Is project mein 5 typed characters ko aik word ke barabar gina jata hai.",
    },
    points: {
      ur: ["پہلے accuracy مستحکم کریں۔", "چھوٹے timed drills استعمال کریں۔", "رفتار بڑھاتے وقت ہاتھ کی movement کم رکھیں۔", "WPM کو accuracy کے ساتھ دیکھیں، اکیلا WPM مقصد نہ بنائیں۔"],
      en: ["Stabilize accuracy first.", "Use short timed drills.", "Keep hand movement economical as speed increases.", "Read WPM together with accuracy instead of treating WPM alone as the goal."],
      roman: ["Pehle accuracy stable karein.", "Chhoti timed drills use karein.", "Speed barhate waqt hand movement kam rakhein.", "WPM ko accuracy ke saath dekhein, sirf WPM ko target na banayein."],
    },
    practice: {
      ur: "ایک منٹ کا test دیں۔ پہلے score لکھیں، پھر 5 منٹ کی accuracy practice کے بعد دوبارہ test دیں اور دونوں scores compare کریں۔",
      en: "Take a one-minute test, record the score, practice accuracy for five minutes, then repeat the test and compare.",
      roman: "Aik minute ka test dein aur score likhein. Phir 5 minute accuracy practice ke baad test dobara dein aur scores compare karein.",
    },
  },
  {
    id: "mistakes",
    title: { ur: "عام typing غلطیاں", en: "Common Typing Mistakes", roman: "Aam Typing Ghaltiyan" },
    explanation: {
      ur: "زیادہ تر beginners ایک ہی طرح کی چند غلطیاں بار بار کرتے ہیں۔ ان کی نشاندہی کرنے سے مشق زیادہ مؤثر ہو جاتی ہے۔",
      en: "Most beginners repeat a small set of mistakes. Identifying your pattern makes practice much more efficient.",
      roman: "Aksar beginners chand hi qisam ki ghaltiyan bar bar karte hain. Apna pattern pehchanne se practice zyada moassar hoti hai.",
    },
    points: {
      ur: ["قریب والی key غلط دبانا۔", "Shift چھوڑ دینا یا غیر ضروری Shift دبانا۔", "Spacebar miss کرنا۔", "جلدی میں اگلے لفظ کی طرف ہاتھ کھینچ لینا۔", "keyboard دیکھنے کی عادت کی وجہ سے home position کھو دینا۔"],
      en: ["Pressing a neighboring key by mistake.", "Missing or unnecessarily holding Shift.", "Skipping a space.", "Moving toward the next word before finishing the current one.", "Losing home position because you keep looking down."],
      roman: ["Qareeb wali key ghalat dabana.", "Shift miss karna ya bila wajah Shift dabana.", "Spacebar miss karna.", "Current lafz mukammal hone se pehle aglay lafz ki taraf haath le jana.", "Keyboard dekhne ki aadat se home position kho dena."],
    },
    practice: {
      ur: "اپنی آخری مشق میں تین سب سے زیادہ آنے والی غلطیاں تلاش کریں اور ہر ایک کے لیے ایک چھوٹا drill بنائیں۔",
      en: "Find your three most common errors in the last exercise and make a short drill for each one.",
      roman: "Apni pichli exercise ki teen sab se aam ghaltiyan dhoondhein aur har aik ke liye chhoti drill banayein.",
    },
  },
  {
    id: "practical",
    title: { ur: "عملی اردو ٹائپنگ", en: "Practical Urdu Typing", roman: "Amli Urdu Typing" },
    explanation: {
      ur: "حقیقی کام میں آپ صرف الگ حروف نہیں بلکہ messages، notes، assignments، office text اور مکمل paragraphs ٹائپ کریں گے۔ اس لیے مشق میں حقیقی جملے شامل کریں۔",
      en: "Real work involves messages, notes, assignments, office text and full paragraphs rather than isolated letters. Practice with realistic material.",
      roman: "Asal kaam mein messages, notes, assignments, office text aur poore paragraphs type karne hote hain. Is liye realistic material se practice karein.",
    },
    points: {
      ur: ["روزمرہ پیغام ٹائپ کریں۔", "چھوٹا note یا to-do لکھیں۔", "تعلیمی paragraph دوبارہ ٹائپ کریں۔", "ایک ہی passage کو دو مختلف رفتاروں پر لکھیں۔"],
      en: ["Type a realistic daily message.", "Write a short note or to-do list.", "Re-type a short educational paragraph.", "Type the same passage at two different speeds."],
      roman: ["Rozmarra ka aik realistic message type karein.", "Chhota note ya to-do likhein.", "Chhota educational paragraph dobara type karein.", "Aik hi passage ko do mukhtalif speeds par type karein."],
    },
    example: { urdu: "آج میں نے اردو ٹائپنگ کی مشق مکمل کی۔", en: "Today I completed my Urdu typing practice.", roman: "Aaj maine Urdu typing ki mashq mukammal ki." },
    practice: {
      ur: "اپنے روزمرہ کام سے متعلق دو جملے لکھیں۔ پہلے accuracy، پھر natural rhythm، اور آخر میں speed دیکھیں۔",
      en: "Write two sentences related to your daily work. Check accuracy first, then natural rhythm, and finally speed.",
      roman: "Apne rozmarra kaam se mutalliq do jumlay likhein. Pehle accuracy, phir natural rhythm aur aakhir mein speed dekhein.",
    },
  },
  {
    id: "intermediate",
    title: { ur: "درمیانی درجے کی تکنیکیں", en: "Intermediate Techniques", roman: "Darmiyani Darjay ki Techniques" },
    explanation: {
      ur: "درمیانی سطح پر آپ key-by-key سوچنے کے بجائے الفاظ اور چھوٹے phrase patterns کو ایک unit کی طرح پہچاننا شروع کرتے ہیں۔",
      en: "At intermediate level, move beyond thinking about every key separately. Recognize common words and short phrase patterns as units.",
      roman: "Intermediate level par har key ko alag sochnay ke bajaye common words aur chhotay phrase patterns ko aik unit ki tarah pehchanna shuru karein.",
    },
    points: {
      ur: ["عام الفاظ کے patterns یاد کریں۔", "نظر اگلے چند حروف پر رکھیں۔", "غلطی کے بعد flow مکمل طور پر نہ توڑیں۔", "لمبے passages میں posture اور ہاتھ کی پوزیشن چیک کرتے رہیں۔"],
      en: ["Memorize patterns in common words.", "Look a few characters ahead.", "Avoid completely breaking flow after one mistake.", "Check posture and hand position during longer passages."],
      roman: ["Aam alfaaz ke patterns yaad karein.", "Nazar chand characters aagay rakhein.", "Aik ghalti ke baad flow ko bilkul na torain.", "Lamay passages mein posture aur hand position check karte rahain."],
    },
    practice: {
      ur: "ایک 3 منٹ کا passage ٹائپ کریں اور صرف ان غلطیوں کو mark کریں جو بار بار دہرائی گئیں۔",
      en: "Type a three-minute passage and mark only errors that repeat. Use those repetitions to choose your next drill.",
      roman: "Teen minute ka passage type karein aur sirf repeat hone wali ghaltiyan mark karein. Agli drill unhi par banayein.",
    },
  },
  {
    id: "advanced",
    title: { ur: "اعلیٰ درجے کی typing", en: "Advanced Typing Techniques", roman: "Aala Darjay ki Typing Techniques" },
    explanation: {
      ur: "اعلیٰ سطح پر مقصد لمبے passages میں accuracy، rhythm اور sustained speed کو ایک ساتھ برقرار رکھنا ہے۔ یہاں raw speed کے بجائے قابلِ اعتماد performance اہم ہے۔",
      en: "Advanced typing is about maintaining accuracy, rhythm and sustainable speed across long passages. Reliable performance matters more than a short burst of raw speed.",
      roman: "Advanced typing mein lambi passages par accuracy, rhythm aur sustainable speed ko aik saath barqarar rakhna maqsad hai. Reliable performance short burst se zyada aham hai.",
    },
    points: {
      ur: ["لمبے passages میں energy اور posture manage کریں۔", "اپنے weak key pairs کے لیے targeted drills بنائیں۔", "مختلف موضوعات کے متن پر practice کریں۔", "Test کے بعد WPM کے ساتھ accuracy اور error pattern بھی review کریں۔"],
      en: ["Manage posture and effort across long passages.", "Build targeted drills for weak key pairs.", "Practice across different types of real text.", "After a test, review WPM together with accuracy and error patterns."],
      roman: ["Lambay passages mein posture aur effort manage karein.", "Weak key pairs ke liye targeted drills banayein.", "Mukhtalif qisam ke real text par practice karein.", "Test ke baad WPM ke saath accuracy aur error patterns bhi review karein."],
    },
    practice: {
      ur: "5 منٹ کا test دیں۔ نتیجے کے بعد صرف score نہ دیکھیں؛ اپنی سب سے زیادہ غلط ہونے والی keys اور patterns کی فہرست بنائیں۔",
      en: "Take a five-minute test. Afterward, review more than the score: list your most error-prone keys and patterns.",
      roman: "Paanch minute ka test dein. Baad mein sirf score na dekhein; sab se zyada ghalat hone wali keys aur patterns ki list banayein.",
    },
  },
];
