import type { IndustryId, Locale, PpeId, RiskLevel } from "./types";

const dict = {
  appName: { ar: "أيجيس", en: "AEGIS" },
  tagline: { ar: "كشف معدات الوقاية للمصانع والمواقع", en: "PPE vision for plants and sites" },
  nav: {
    dashboard: { ar: "العمليات", en: "Operations" },
    scan: { ar: "الكشف", en: "Inspect" },
    incidents: { ar: "المخالفات", en: "Incidents" },
    sites: { ar: "المواقع", en: "Sites" },
    reports: { ar: "التقارير", en: "Reports" },
    settings: { ar: "الإعدادات", en: "Settings" },
    admin: { ar: "الإدارة", en: "Admin" },
    platform: { ar: "المالك", en: "Owner" },
  },
  kpi: {
    compliance: { ar: "الالتزام", en: "Compliance" },
    open: { ar: "مخالفات مفتوحة", en: "Open incidents" },
    scans: { ar: "فحوصات اليوم", en: "Scans today" },
    cameras: { ar: "كاميرات نشطة", en: "Live cameras" },
    persons: { ar: "أشخاص", en: "Persons" },
    missing: { ar: "ناقص", en: "Missing" },
  },
  scan: {
    title: { ar: "مفتش الرؤية", en: "Vision inspector" },
    analyze: { ar: "تحليل بالذكاء الاصطناعي", en: "Analyze with AI" },
    analyzing: { ar: "جاري التحليل…", en: "Analyzing…" },
    capture: { ar: "التقاط", en: "Capture" },
    upload: { ar: "رفع صورة", en: "Upload image" },
    webcam: { ar: "كاميرا حية", en: "Live camera" },
    startCam: { ar: "تشغيل الكاميرا", en: "Start camera" },
    stopCam: { ar: "إيقاف", en: "Stop" },
    watch: { ar: "مراقبة دورية", en: "Watch mode" },
    stopWatch: { ar: "إيقاف المراقبة", en: "Stop watch" },
    sample: { ar: "تغذية نموذجية", en: "Sample feed" },
    noCam: {
      ar: "الكاميرا غير متاحة في هذا الجهاز. استخدم التغذية النموذجية أو ارفع صورة من الموقع.",
      en: "Camera is not available here. Use a sample feed or upload a site photo.",
    },
    empty: { ar: "اختر كاميرا أو ارفع إطاراً للفحص.", en: "Pick a camera or upload a frame to inspect." },
    result: { ar: "نتيجة الفحص", en: "Inspection result" },
    noPeople: { ar: "لا يوجد عمال في الإطار.", en: "No workers detected in frame." },
    cached: { ar: "نتيجة محفوظة للتغذية", en: "Cached feed inspection" },
    liveAi: { ar: "تحليل مباشر", en: "Live AI" },
    required: { ar: "يفحص الآن", en: "This camera checks" },
    lastScan: { ar: "آخر فحص", en: "Last scan" },
    configure: { ar: "تعديل الفحص", en: "Edit checks" },
  },
  incident: {
    title: { ar: "سجل المخالفات", en: "Incident log" },
    open: { ar: "مفتوح", en: "Open" },
    ack: { ar: "مُقرّ", en: "Acknowledged" },
    closed: { ar: "مغلق", en: "Closed" },
    empty: { ar: "لا مخالفات في هذا المرشح.", en: "No incidents for this filter." },
    ackAll: { ar: "إقرار الكل", en: "Ack all" },
    filter: { ar: "الكل", en: "All" },
  },
  sites: {
    title: { ar: "المواقع والمناطق", en: "Sites and zones" },
    industry: { ar: "نوع المنشأة", en: "Industry" },
    zones: { ar: "المناطق", en: "Zones" },
    required: { ar: "المعدات المطلوبة", en: "Required PPE" },
    add: { ar: "إضافة موقع", en: "Add site" },
    save: { ar: "حفظ", en: "Save" },
    name: { ar: "اسم الموقع", en: "Site name" },
    city: { ar: "المدينة", en: "City" },
  },
  cameras: {
    add: { ar: "إضافة كاميرا", en: "Add camera" },
    empty: { ar: "لا توجد كاميرات بعد. أضف كاميرا من المواقع.", en: "No cameras yet. Add one from Sites." },
    name: { ar: "اسم الكاميرا", en: "Camera name" },
    rtsp: { ar: "رابط RTSP", en: "RTSP URL" },
    site: { ar: "الموقع", en: "Site" },
  },
  reports: {
    title: { ar: "تقارير الالتزام", en: "Compliance reports" },
    byHour: { ar: "المخالفات خلال اليوم", en: "Incidents through the day" },
    byPpe: { ar: "نواقص المعدات", en: "Missing PPE" },
    bySite: { ar: "الالتزام حسب الموقع", en: "Compliance by site" },
    hourly: { ar: "تقارير المدير الساعة", en: "Hourly manager briefs" },
    send: { ar: "إرسال للمدير", en: "Send to manager" },
    sent: { ar: "أُرسل", en: "Sent" },
    ready: { ar: "جاهز", en: "Ready" },
    emptyHour: { ar: "لا مخالفات في هذه الساعة.", en: "No violations this hour." },
    next: { ar: "التقرير التالي", en: "Next brief" },
    sendNow: { ar: "إنشاء تقرير الساعة", en: "Generate this hour" },
  },
  settings: {
    title: { ar: "الإعدادات", en: "Settings" },
    manager: { ar: "المدير", en: "Manager" },
    managerName: { ar: "اسم المدير", en: "Manager name" },
    managerEmail: { ar: "البريد الإلكتروني", en: "Email" },
    hourly: { ar: "تقرير كل ساعة", en: "Hourly report" },
    hourlyHint: {
      ar: "يجمع مخالفات الساعة الماضية ويرسلها لبريد المدير.",
      en: "Collects the last hour of violations and emails the manager.",
    },
    cameras: { ar: "ماذا تفحص كل كاميرا", en: "What each camera checks" },
    camerasHint: {
      ar: "فعّل الكاميرا، ثم اختر المعدات فقط. كاميرا للخوذة، وأخرى للخوذة والسترة.",
      en: "Enable a camera, then pick only the PPE it should flag.",
    },
    enabled: { ar: "مفعّلة", en: "Enabled" },
    disabled: { ar: "متوقفة", en: "Off" },
    all: { ar: "كل المعدات", en: "All PPE" },
    clear: { ar: "مسح", en: "Clear" },
    reset: { ar: "الافتراضي", en: "Default" },
    selected: { ar: "مختار", en: "selected" },
    emailMissing: { ar: "أضف بريد المدير أولاً.", en: "Add the manager email first." },
    copied: { ar: "نُسخ التقرير", en: "Report copied" },
    engine: { ar: "محرك الكشف", en: "Detection engine" },
    engineLlm: {
      ar: "اللوحة الحالية تستخدم نموذج رؤية لغوي (LLM) على الصورة: يفهم المشهد والمعدات من إطار واحد. مناسب للتجربة والمراجعة، وليس لبث 30 صورة/ثانية.",
      en: "This console uses a vision language model (LLM) on a still frame. Good for review, not 30fps camera streams.",
    },
    engineYolo: {
      ar: "التشغيل في المصنع يتم بـ YOLO على جهاز محلي: أسرع، يعمل بدون إنترنت، ويقرأ كاميرات RTSP. حمّل سكربت بايثون وافتحه من PyCharm.",
      en: "Factory runtime is YOLO on a local box: faster, offline, RTSP cameras. Download the Python script and open it in PyCharm.",
    },
    factory: { ar: "التشغيل في المصنع", en: "Run in the plant" },
    factoryHint: {
      ar: "هذه الشاشات هي غرفة التحكم. الكاميرات الحقيقية تحتاج جهاز عند البوابة يشغّل كاشف YOLO ثم يرسل المخالفات إلى هنا.",
      en: "These screens are the control room. Live cameras need a gate-side box running YOLO, then posting violations here.",
    },
    downloadPy: { ar: "تحميل كاشف بايثون", en: "Download Python detector" },
    downloadReq: { ar: "تحميل المكتبات", en: "Download requirements" },
    rtsp: { ar: "رابط RTSP", en: "RTSP URL" },
    detector: { ar: "عنوان كاشف YOLO", en: "YOLO detector URL" },
    ingest: { ar: "مفتاح الإرسال", en: "Ingest key" },
    ingestHint: {
      ar: "ضعه على جهاز المصنع. يظهر مرة واحدة. YOLO يرسل المخالفات إلى المنصة بهذا المفتاح.",
      en: "Put this on the plant box. Shown once. YOLO posts violations with this key.",
    },
    rotateKey: { ar: "إصدار مفتاح جديد", en: "Issue new key" },
    saveDetector: { ar: "حفظ الكاشف", en: "Save detector" },
    mailOn: { ar: "SMTP جاهز", en: "SMTP ready" },
    mailOff: { ar: "SMTP غير مضبوط", en: "SMTP not configured" },
    yoloOn: { ar: "YOLO متصل", en: "YOLO connected" },
    yoloOff: { ar: "YOLO محلي غير مربوط", en: "YOLO not linked" },
    sentSmtp: { ar: "اتبعت التقرير على البريد", en: "Report emailed" },
    smtpFail: { ar: "تعذر الإرسال. راجع SMTP_HOST و SMTP_FROM.", en: "Send failed. Set SMTP_HOST and SMTP_FROM." },
  },
  login: {
    title: { ar: "دخول غرفة التحكم", en: "Control room sign-in" },
    product: { ar: "منصة سلامة للمصانع", en: "Plant safety platform" },
    hint: {
      ar: "الدخول باسم مستخدم وكلمة مرور يصدرهما مالك النظام بعد الاشتراك.",
      en: "Sign in with a username and password issued by the product owner after payment.",
    },
    user: { ar: "اسم المستخدم", en: "Username" },
    password: { ar: "كلمة المرور", en: "Password" },
    name: { ar: "الاسم", en: "Name" },
    submit: { ar: "دخول", en: "Sign in" },
    signOut: { ar: "خروج", en: "Sign out" },
    failed: { ar: "تعذر الدخول. تحقق من البيانات.", en: "Sign-in failed. Check your details." },
    disabled: { ar: "تسجيل الدخول غير مفعّل.", en: "Sign-in is disabled." },
  },
  admin: {
    title: { ar: "لوحة الإدارة", en: "Admin console" },
    org: { ar: "المؤسسة", en: "Organization" },
    orgName: { ar: "اسم المنشأة", en: "Plant name" },
    orgNameAr: { ar: "الاسم بالعربية", en: "Arabic name" },
    users: { ar: "المستخدمون", en: "Users" },
    invites: { ar: "الدعوات", en: "Invites" },
    invite: { ar: "إنشاء دعوة", en: "Create invite" },
    inviteHint: {
      ar: "رمز لمرة واحدة، صالح 7 أيام. لا يتجاوز عدد المقاعد.",
      en: "One-time code, valid 7 days. Cannot exceed seat count.",
    },
    code: { ar: "رمز الدعوة", en: "Invite code" },
    remove: { ar: "إزالة", en: "Remove" },
    role: {
      platform: { ar: "مالك المنتج", en: "Product owner" },
      owner: { ar: "مالك المنشأة", en: "Plant owner" },
      admin: { ar: "مدير", en: "Admin" },
      member: { ar: "مشغّل", en: "Operator" },
    },
    plan: {
      trial: { ar: "تجريبي", en: "Trial" },
      plant: { ar: "منشأة", en: "Plant" },
      enterprise: { ar: "مؤسسي", en: "Enterprise" },
    },
    seats: { ar: "مقاعد", en: "seats" },
    seatsUsed: { ar: "مستخدم", en: "used" },
    full: { ar: "لا توجد مقاعد متبقية على هذه الخطة.", en: "No seats left on this plan." },
    usersReadOnly: {
      ar: "إنشاء المستخدمين من لوحة مالك المنتج فقط.",
      en: "Only the product owner can create users.",
    },
  },
  platform: {
    title: { ar: "لوحة مالك المنتج", en: "Product owner console" },
    hint: {
      ar: "أنت تنشئ المنشآت والمستخدمين. المشترك يدفع، وأنت تبعث له اسم المستخدم وكلمة المرور.",
      en: "You create plants and users. The subscriber pays; you send them a username and password.",
    },
    plants: { ar: "المنشآت", en: "Plants" },
    seatsOpen: { ar: "مقاعد متبقية", en: "Open seats" },
    newPlant: { ar: "منشأة جديدة", en: "New plant" },
    createPlant: { ar: "إنشاء المنشأة", en: "Create plant" },
    plantOk: { ar: "تم إنشاء المنشأة", en: "Plant created" },
    plantFail: { ar: "تعذر إنشاء المنشأة. حاول مرة أخرى.", en: "Could not create the plant. Try again." },
    newUser: { ar: "مستخدم جديد", en: "New user" },
    userHint: {
      ar: "اكتب يوزرنيم وباسورد وابعتهما للمشترك. لا يوجد تسجيل ذاتي.",
      en: "Set a username and password and send them to the subscriber. No self-signup.",
    },
    createUser: { ar: "إنشاء المستخدم", en: "Create user" },
    userFail: { ar: "تعذر الإنشاء. تحقق من اليوزرنيم والمقاعد.", en: "Could not create. Check username and seats." },
    resetPass: { ar: "كلمة مرور جديدة", en: "New password" },
    findUser: { ar: "ابحث عن مستخدم", en: "Find a user" },
    lock: { ar: "قفل الحساب", en: "Lock account" },
    unlock: { ar: "فتح الحساب", en: "Unlock" },
    locked: { ar: "مقفل", en: "Locked" },
    audit: { ar: "سجل العمليات", en: "Audit log" },
  },
  locked: {
    title: { ar: "لا يوجد حساب مفعّل", en: "No provisioned account" },
    hint: {
      ar: "الحسابات ينشئها مالك النظام فقط بعد الاشتراك والدفع.",
      en: "Accounts are created only by the product owner after subscription and payment.",
    },
    offTitle: { ar: "الحساب مقفول", en: "Account locked" },
    offHint: {
      ar: "مالك النظام قفل هذا الحساب. النظام متوقف عندك لحين ما يفتحه تاني.",
      en: "The product owner locked this account. Access stays off until they unlock it.",
    },
    retry: { ar: "تعذر فتح اللوحة. اضغط للدخول مرة أخرى.", en: "Could not open the console. Tap to retry." },
  },
  risk: {
    low: { ar: "منخفض", en: "Low" },
    medium: { ar: "متوسط", en: "Medium" },
    high: { ar: "مرتفع", en: "High" },
    critical: { ar: "حرج", en: "Critical" },
  },
  ppe: {
    helmet: { ar: "خوذة", en: "Helmet" },
    vest: { ar: "سترة عاكسة", en: "Hi-vis vest" },
    goggles: { ar: "نظارات واقية", en: "Goggles" },
    gloves: { ar: "قفازات", en: "Gloves" },
    boots: { ar: "أحذية سلامة", en: "Safety boots" },
    mask: { ar: "واقي تنفس", en: "Respirator" },
    ear: { ar: "واقي أذن", en: "Ear protection" },
    harness: { ar: "حزام سقوط", en: "Fall harness" },
    faceshield: { ar: "واقي وجه", en: "Face shield" },
    coverall: { ar: "بدلة واقية", en: "Coverall" },
    hairnet: { ar: "شبكة شعر", en: "Hairnet" },
    labcoat: { ar: "بالطو", en: "Lab coat" },
    facemask: { ar: "كمامة", en: "Face mask" },
  } satisfies Record<PpeId, { ar: string; en: string }>,
  industry: {
    construction: { ar: "إنشاءات", en: "Construction" },
    oilgas: { ar: "نفط وغاز", en: "Oil & gas" },
    chemical: { ar: "كيماويات", en: "Chemical" },
    food: { ar: "أغذية", en: "Food" },
    warehouse: { ar: "مستودعات", en: "Warehouse" },
    welding: { ar: "لحام", en: "Welding" },
    electrical: { ar: "كهرباء", en: "Electrical" },
    mining: { ar: "تعدين", en: "Mining" },
    manufacturing: { ar: "تصنيع", en: "Manufacturing" },
    pharma: { ar: "أدوية", en: "Pharma" },
    hospital: { ar: "مستشفى", en: "Hospital" },
  } satisfies Record<IndustryId, { ar: string; en: string }>,
  toast: {
    violation: { ar: "مخالفة وقاية", en: "PPE violation" },
    aiOff: {
      ar: "لا يوجد كاشف محلي ولا مفتاح سحابي. شغّل public/factory/aegis_ppe_detector.py على المنفذ 8090 أو ضع XAI_API_KEY.",
      en: "No local detector or cloud key. Start public/factory/aegis_ppe_detector.py on port 8090, or set XAI_API_KEY.",
    },
    aiErr: { ar: "تعذر التحليل. أعد المحاولة.", en: "Analysis failed. Try again." },
    saved: { ar: "تم الحفظ", en: "Saved" },
    briefReady: { ar: "تقرير الساعة جاهز للمدير", en: "Hourly brief is ready" },
  },
  lang: { ar: "EN", en: "ع" },
} as const;

type Leaf = { ar: string; en: string };

function lookup(path: string): Leaf | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur && typeof cur === "object" && "ar" in cur && "en" in cur) {
    return cur as Leaf;
  }
  return undefined;
}

export function t(locale: Locale, path: string): string {
  const leaf = lookup(path);
  if (!leaf) return path;
  return leaf[locale];
}

export function ppeLabel(locale: Locale, id: PpeId): string {
  return t(locale, `ppe.${id}`);
}

export function industryLabel(locale: Locale, id: IndustryId): string {
  return t(locale, `industry.${id}`);
}

export function riskLabel(locale: Locale, id: RiskLevel): string {
  return t(locale, `risk.${id}`);
}

export function formatTime(locale: Locale, ts: number): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function formatDateTime(locale: Locale, ts: number): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function formatRelative(locale: Locale, ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.round(diff / 60000);
  if (min < 1) return locale === "ar" ? "الآن" : "just now";
  if (min < 60) return locale === "ar" ? `منذ ${min} د` : `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return locale === "ar" ? `منذ ${h} س` : `${h}h ago`;
  const d = Math.round(h / 24);
  return locale === "ar" ? `منذ ${d} ي` : `${d}d ago`;
}
