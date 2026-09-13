import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-ByR_bG0u.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
function applyChecks(result, checks) {
	const need = checks.length ? checks : [];
	const persons = result.persons.map((p) => {
		const missing = need.filter((id) => !p.present.includes(id));
		return {
			...p,
			missing,
			compliant: missing.length === 0
		};
	});
	const viol = persons.filter((p) => !p.compliant).length;
	let risk = "low";
	if (viol === 0) risk = "low";
	else if (persons.some((p) => p.missing.includes("harness"))) risk = "critical";
	else if (viol / Math.max(1, persons.length) >= .5) risk = "high";
	else risk = "medium";
	const summary = viol === 0 ? persons.length ? "All detected workers meet this camera's checks." : "No workers detected." : `${viol} of ${persons.length} workers missing checked PPE.`;
	const summaryAr = viol === 0 ? persons.length ? "كل العمال المكتشفين يطابقون فحص هذه الكاميرا." : "لا يوجد عمال في الإطار." : `${viol} من ${persons.length} عمال ينقصهم معدات هذا الفحص.`;
	return {
		...result,
		persons,
		risk,
		summary,
		summaryAr
	};
}
var SITES = [
	{
		id: "cairo-east",
		name: "Cairo East Construction",
		nameAr: "موقع القاهرة الشرقية",
		industry: "construction",
		city: "Cairo",
		cityAr: "القاهرة",
		zones: [{
			id: "gate",
			name: "Main gate",
			nameAr: "البوابة الرئيسية",
			required: [
				"helmet",
				"vest",
				"boots",
				"goggles"
			]
		}, {
			id: "scaffold-a",
			name: "Scaffold A",
			nameAr: "سقالة أ",
			required: [
				"helmet",
				"vest",
				"boots",
				"harness",
				"goggles"
			]
		}]
	},
	{
		id: "suez-chem",
		name: "Suez Petrochemical Complex",
		nameAr: "مجمع السويس للبتروكيماويات",
		industry: "chemical",
		city: "Suez",
		cityAr: "السويس",
		zones: [{
			id: "process",
			name: "Process catwalk",
			nameAr: "ممر العمليات",
			required: [
				"goggles",
				"gloves",
				"mask",
				"boots",
				"coverall"
			]
		}]
	},
	{
		id: "oct-wh",
		name: "6th of October Warehouse",
		nameAr: "مخازن 6 أكتوبر",
		industry: "warehouse",
		city: "6th of October",
		cityAr: "6 أكتوبر",
		zones: [{
			id: "aisle-4",
			name: "Aisle 4",
			nameAr: "ممر 4",
			required: [
				"vest",
				"boots",
				"gloves"
			]
		}]
	},
	{
		id: "tenth-weld",
		name: "10th of Ramadan Welding Bay",
		nameAr: "ورشة اللحام — العاشر من رمضان",
		industry: "welding",
		city: "10th of Ramadan",
		cityAr: "العاشر من رمضان",
		zones: [{
			id: "bay-2",
			name: "Bay 2",
			nameAr: "الحوض 2",
			required: [
				"faceshield",
				"gloves",
				"boots",
				"coverall"
			]
		}]
	},
	{
		id: "helwan-steel",
		name: "Helwan Steel Mill",
		nameAr: "مصنع حلوان للصلب",
		industry: "manufacturing",
		city: "Helwan",
		cityAr: "حلوان",
		zones: [{
			id: "line-3",
			name: "Line 3",
			nameAr: "خط 3",
			required: [
				"helmet",
				"vest",
				"goggles",
				"gloves",
				"boots"
			]
		}]
	},
	{
		id: "nasser-hospital",
		name: "Nasser Medical Complex",
		nameAr: "مجمع ناصر الطبي",
		industry: "hospital",
		city: "Cairo",
		cityAr: "القاهرة",
		zones: [{
			id: "ward-b",
			name: "Ward B",
			nameAr: "عنبر ب",
			required: [
				"labcoat",
				"facemask",
				"gloves",
				"hairnet"
			]
		}]
	},
	{
		id: "giza-pharma",
		name: "Giza Pharma Fill Line",
		nameAr: "خط التعبئة — أدوية الجيزة",
		industry: "pharma",
		city: "Giza",
		cityAr: "الجيزة",
		zones: [{
			id: "clean-2",
			name: "Clean room 2",
			nameAr: "غرفة نظيفة 2",
			required: [
				"labcoat",
				"facemask",
				"gloves",
				"goggles",
				"hairnet"
			]
		}]
	}
];
var gate = {
	scene: "Construction gate, two workers approaching",
	risk: "high",
	summary: "1 of 2 workers missing a hard hat.",
	summaryAr: "عامل من اثنين بدون خوذة.",
	persons: [{
		id: "P1",
		bbox: {
			x: .16,
			y: .26,
			w: .26,
			h: .7
		},
		present: [
			"helmet",
			"vest",
			"goggles",
			"gloves",
			"boots"
		],
		missing: [],
		confidence: .94,
		compliant: true
	}, {
		id: "P2",
		bbox: {
			x: .5,
			y: .3,
			w: .26,
			h: .66
		},
		present: [
			"vest",
			"gloves",
			"boots"
		],
		missing: ["helmet", "goggles"],
		confidence: .91,
		compliant: false,
		notes: "Phone in hand, no helmet"
	}]
};
var scaffold = {
	scene: "Elevated scaffold, worker at height",
	risk: "critical",
	summary: "Worker at height with no fall-arrest harness.",
	summaryAr: "عامل على ارتفاع بدون حزام سقوط.",
	persons: [{
		id: "P1",
		bbox: {
			x: .34,
			y: .3,
			w: .26,
			h: .44
		},
		present: ["helmet", "boots"],
		missing: [
			"harness",
			"vest",
			"goggles"
		],
		confidence: .88,
		compliant: false,
		notes: "Work at height — harness required"
	}]
};
var process = {
	scene: "Chemical process catwalk",
	risk: "low",
	summary: "Worker in full chemical PPE.",
	summaryAr: "العامل بكامل معدات الوقاية الكيميائية.",
	persons: [{
		id: "P1",
		bbox: {
			x: .6,
			y: .16,
			w: .24,
			h: .74
		},
		present: [
			"coverall",
			"mask",
			"goggles",
			"gloves",
			"boots"
		],
		missing: [],
		confidence: .93,
		compliant: true
	}]
};
var CAMERAS = [
	{
		id: "cam-gate",
		name: "CAM-01 Gate",
		nameAr: "كام-01 البوابة",
		siteId: "cairo-east",
		zoneId: "gate",
		image: "/demo/cam-gate.jpg",
		kind: "sample",
		cached: gate
	},
	{
		id: "cam-scaffold",
		name: "CAM-02 Scaffold A",
		nameAr: "كام-02 سقالة أ",
		siteId: "cairo-east",
		zoneId: "scaffold-a",
		image: "/demo/cam-scaffold.jpg",
		kind: "sample",
		cached: scaffold
	},
	{
		id: "cam-process",
		name: "CAM-03 Process",
		nameAr: "كام-03 العمليات",
		siteId: "suez-chem",
		zoneId: "process",
		image: "/demo/cam-process.jpg",
		kind: "sample",
		cached: process
	},
	{
		id: "cam-warehouse",
		name: "CAM-04 Aisle 4",
		nameAr: "كام-04 ممر 4",
		siteId: "oct-wh",
		zoneId: "aisle-4",
		image: "/demo/cam-warehouse.jpg",
		kind: "sample",
		cached: {
			scene: "Warehouse aisle with forklift traffic",
			risk: "high",
			summary: "Worker in traffic aisle without a hi-vis vest.",
			summaryAr: "عامل في ممر الحركة بدون سترة عاكسة.",
			persons: [{
				id: "P1",
				bbox: {
					x: .16,
					y: .2,
					w: .24,
					h: .72
				},
				present: ["boots"],
				missing: ["vest", "gloves"],
				confidence: .9,
				compliant: false,
				notes: "Sneakers, no hi-vis"
			}]
		}
	},
	{
		id: "cam-weld",
		name: "CAM-05 Bay 2",
		nameAr: "كام-05 الحوض 2",
		siteId: "tenth-weld",
		zoneId: "bay-2",
		image: "/demo/cam-weld.jpg",
		kind: "sample",
		cached: {
			scene: "Welding bay with active arc",
			risk: "low",
			summary: "Welder using helmet, gloves, apron and boots.",
			summaryAr: "اللحّام يستخدم خوذة اللحام والقفازات والمريلة والأحذية.",
			persons: [{
				id: "P1",
				bbox: {
					x: .14,
					y: .2,
					w: .42,
					h: .7
				},
				present: [
					"faceshield",
					"gloves",
					"coverall",
					"boots"
				],
				missing: [],
				confidence: .92,
				compliant: true
			}]
		}
	},
	{
		id: "cam-floor",
		name: "CAM-06 Line 3",
		nameAr: "كام-06 خط 3",
		siteId: "helwan-steel",
		zoneId: "line-3",
		image: "/demo/cam-floor.jpg",
		kind: "sample",
		cached: {
			scene: "Production floor, three workers",
			risk: "high",
			summary: "2 of 3 workers missing required PPE.",
			summaryAr: "عاملان من ثلاثة ينقصهم معدات مطلوبة.",
			persons: [
				{
					id: "P1",
					bbox: {
						x: 0,
						y: .26,
						w: .2,
						h: .7
					},
					present: [
						"helmet",
						"vest",
						"goggles",
						"gloves",
						"boots"
					],
					missing: [],
					confidence: .9,
					compliant: true
				},
				{
					id: "P2",
					bbox: {
						x: .38,
						y: .28,
						w: .22,
						h: .68
					},
					present: [
						"vest",
						"gloves",
						"boots"
					],
					missing: ["helmet", "goggles"],
					confidence: .89,
					compliant: false
				},
				{
					id: "P3",
					bbox: {
						x: .74,
						y: .26,
						w: .22,
						h: .7
					},
					present: ["helmet", "boots"],
					missing: [
						"vest",
						"goggles",
						"gloves"
					],
					confidence: .87,
					compliant: false
				}
			]
		}
	},
	{
		id: "cam-ward",
		name: "CAM-07 Ward B",
		nameAr: "كام-07 عنبر ب",
		siteId: "nasser-hospital",
		zoneId: "ward-b",
		image: "/demo/cam-process.jpg",
		kind: "sample",
		cached: process
	}
];
var WEBCAM = {
	id: "webcam",
	name: "CAM-00 Live",
	nameAr: "كام-00 مباشرة",
	siteId: "cairo-east",
	zoneId: "gate",
	image: "",
	kind: "webcam"
};
var DEFAULT_CAMERA_RULES = {
	"cam-gate": {
		enabled: true,
		checks: ["helmet"]
	},
	"cam-scaffold": {
		enabled: true,
		checks: ["helmet", "harness"]
	},
	"cam-process": {
		enabled: true,
		checks: [
			"mask",
			"goggles",
			"gloves"
		]
	},
	"cam-warehouse": {
		enabled: true,
		checks: ["vest"]
	},
	"cam-weld": {
		enabled: true,
		checks: ["faceshield", "gloves"]
	},
	"cam-floor": {
		enabled: true,
		checks: ["helmet", "vest"]
	},
	"cam-ward": {
		enabled: true,
		checks: ["labcoat", "facemask"]
	},
	webcam: {
		enabled: true,
		checks: ["helmet", "vest"]
	}
};
var dict = {
	appName: {
		ar: "أيجيس",
		en: "AEGIS"
	},
	tagline: {
		ar: "كشف معدات الوقاية للمصانع والمواقع",
		en: "PPE vision for plants and sites"
	},
	nav: {
		dashboard: {
			ar: "العمليات",
			en: "Operations"
		},
		scan: {
			ar: "الكشف",
			en: "Inspect"
		},
		incidents: {
			ar: "المخالفات",
			en: "Incidents"
		},
		sites: {
			ar: "المواقع",
			en: "Sites"
		},
		reports: {
			ar: "التقارير",
			en: "Reports"
		},
		settings: {
			ar: "الإعدادات",
			en: "Settings"
		},
		admin: {
			ar: "الإدارة",
			en: "Admin"
		},
		platform: {
			ar: "المالك",
			en: "Owner"
		}
	},
	kpi: {
		compliance: {
			ar: "الالتزام",
			en: "Compliance"
		},
		open: {
			ar: "مخالفات مفتوحة",
			en: "Open incidents"
		},
		scans: {
			ar: "فحوصات اليوم",
			en: "Scans today"
		},
		cameras: {
			ar: "كاميرات نشطة",
			en: "Live cameras"
		},
		persons: {
			ar: "أشخاص",
			en: "Persons"
		},
		missing: {
			ar: "ناقص",
			en: "Missing"
		}
	},
	scan: {
		title: {
			ar: "مفتش الرؤية",
			en: "Vision inspector"
		},
		analyze: {
			ar: "تحليل بالذكاء الاصطناعي",
			en: "Analyze with AI"
		},
		analyzing: {
			ar: "جاري التحليل…",
			en: "Analyzing…"
		},
		capture: {
			ar: "التقاط",
			en: "Capture"
		},
		upload: {
			ar: "رفع صورة",
			en: "Upload image"
		},
		webcam: {
			ar: "كاميرا حية",
			en: "Live camera"
		},
		startCam: {
			ar: "تشغيل الكاميرا",
			en: "Start camera"
		},
		stopCam: {
			ar: "إيقاف",
			en: "Stop"
		},
		watch: {
			ar: "مراقبة دورية",
			en: "Watch mode"
		},
		stopWatch: {
			ar: "إيقاف المراقبة",
			en: "Stop watch"
		},
		sample: {
			ar: "تغذية نموذجية",
			en: "Sample feed"
		},
		noCam: {
			ar: "الكاميرا غير متاحة في هذا الجهاز. استخدم التغذية النموذجية أو ارفع صورة من الموقع.",
			en: "Camera is not available here. Use a sample feed or upload a site photo."
		},
		empty: {
			ar: "اختر كاميرا أو ارفع إطاراً للفحص.",
			en: "Pick a camera or upload a frame to inspect."
		},
		result: {
			ar: "نتيجة الفحص",
			en: "Inspection result"
		},
		noPeople: {
			ar: "لا يوجد عمال في الإطار.",
			en: "No workers detected in frame."
		},
		cached: {
			ar: "نتيجة محفوظة للتغذية",
			en: "Cached feed inspection"
		},
		liveAi: {
			ar: "تحليل مباشر",
			en: "Live AI"
		},
		required: {
			ar: "يفحص الآن",
			en: "This camera checks"
		},
		lastScan: {
			ar: "آخر فحص",
			en: "Last scan"
		},
		configure: {
			ar: "تعديل الفحص",
			en: "Edit checks"
		}
	},
	incident: {
		title: {
			ar: "سجل المخالفات",
			en: "Incident log"
		},
		open: {
			ar: "مفتوح",
			en: "Open"
		},
		ack: {
			ar: "مُقرّ",
			en: "Acknowledged"
		},
		closed: {
			ar: "مغلق",
			en: "Closed"
		},
		empty: {
			ar: "لا مخالفات في هذا المرشح.",
			en: "No incidents for this filter."
		},
		ackAll: {
			ar: "إقرار الكل",
			en: "Ack all"
		},
		filter: {
			ar: "الكل",
			en: "All"
		}
	},
	sites: {
		title: {
			ar: "المواقع والمناطق",
			en: "Sites and zones"
		},
		industry: {
			ar: "نوع المنشأة",
			en: "Industry"
		},
		zones: {
			ar: "المناطق",
			en: "Zones"
		},
		required: {
			ar: "المعدات المطلوبة",
			en: "Required PPE"
		},
		add: {
			ar: "إضافة موقع",
			en: "Add site"
		},
		save: {
			ar: "حفظ",
			en: "Save"
		},
		name: {
			ar: "اسم الموقع",
			en: "Site name"
		},
		city: {
			ar: "المدينة",
			en: "City"
		}
	},
	reports: {
		title: {
			ar: "تقارير الالتزام",
			en: "Compliance reports"
		},
		byHour: {
			ar: "المخالفات خلال اليوم",
			en: "Incidents through the day"
		},
		byPpe: {
			ar: "نواقص المعدات",
			en: "Missing PPE"
		},
		bySite: {
			ar: "الالتزام حسب الموقع",
			en: "Compliance by site"
		},
		hourly: {
			ar: "تقارير المدير الساعة",
			en: "Hourly manager briefs"
		},
		send: {
			ar: "إرسال للمدير",
			en: "Send to manager"
		},
		sent: {
			ar: "أُرسل",
			en: "Sent"
		},
		ready: {
			ar: "جاهز",
			en: "Ready"
		},
		emptyHour: {
			ar: "لا مخالفات في هذه الساعة.",
			en: "No violations this hour."
		},
		next: {
			ar: "التقرير التالي",
			en: "Next brief"
		},
		sendNow: {
			ar: "إنشاء تقرير الساعة",
			en: "Generate this hour"
		}
	},
	settings: {
		title: {
			ar: "الإعدادات",
			en: "Settings"
		},
		manager: {
			ar: "المدير",
			en: "Manager"
		},
		managerName: {
			ar: "اسم المدير",
			en: "Manager name"
		},
		managerEmail: {
			ar: "البريد الإلكتروني",
			en: "Email"
		},
		hourly: {
			ar: "تقرير كل ساعة",
			en: "Hourly report"
		},
		hourlyHint: {
			ar: "يجمع مخالفات الساعة الماضية ويرسلها لبريد المدير.",
			en: "Collects the last hour of violations and emails the manager."
		},
		cameras: {
			ar: "ماذا تفحص كل كاميرا",
			en: "What each camera checks"
		},
		camerasHint: {
			ar: "فعّل الكاميرا، ثم اختر المعدات فقط. كاميرا للخوذة، وأخرى للخوذة والسترة.",
			en: "Enable a camera, then pick only the PPE it should flag."
		},
		enabled: {
			ar: "مفعّلة",
			en: "Enabled"
		},
		disabled: {
			ar: "متوقفة",
			en: "Off"
		},
		all: {
			ar: "كل المعدات",
			en: "All PPE"
		},
		clear: {
			ar: "مسح",
			en: "Clear"
		},
		reset: {
			ar: "الافتراضي",
			en: "Default"
		},
		selected: {
			ar: "مختار",
			en: "selected"
		},
		emailMissing: {
			ar: "أضف بريد المدير أولاً.",
			en: "Add the manager email first."
		},
		copied: {
			ar: "نُسخ التقرير",
			en: "Report copied"
		},
		engine: {
			ar: "محرك الكشف",
			en: "Detection engine"
		},
		engineLlm: {
			ar: "اللوحة الحالية تستخدم نموذج رؤية لغوي (LLM) على الصورة: يفهم المشهد والمعدات من إطار واحد. مناسب للتجربة والمراجعة، وليس لبث 30 صورة/ثانية.",
			en: "This console uses a vision language model (LLM) on a still frame. Good for review, not 30fps camera streams."
		},
		engineYolo: {
			ar: "التشغيل في المصنع يتم بـ YOLO على جهاز محلي: أسرع، يعمل بدون إنترنت، ويقرأ كاميرات RTSP. حمّل سكربت بايثون وافتحه من PyCharm.",
			en: "Factory runtime is YOLO on a local box: faster, offline, RTSP cameras. Download the Python script and open it in PyCharm."
		},
		factory: {
			ar: "التشغيل في المصنع",
			en: "Run in the plant"
		},
		factoryHint: {
			ar: "هذه الشاشات هي غرفة التحكم. الكاميرات الحقيقية تحتاج جهاز عند البوابة يشغّل كاشف YOLO ثم يرسل المخالفات إلى هنا.",
			en: "These screens are the control room. Live cameras need a gate-side box running YOLO, then posting violations here."
		},
		downloadPy: {
			ar: "تحميل كاشف بايثون",
			en: "Download Python detector"
		},
		downloadReq: {
			ar: "تحميل المكتبات",
			en: "Download requirements"
		}
	},
	login: {
		title: {
			ar: "دخول غرفة التحكم",
			en: "Control room sign-in"
		},
		product: {
			ar: "منصة سلامة للمصانع",
			en: "Plant safety platform"
		},
		hint: {
			ar: "الدخول باسم مستخدم وكلمة مرور يصدرهما مالك النظام بعد الاشتراك.",
			en: "Sign in with a username and password issued by the product owner after payment."
		},
		user: {
			ar: "اسم المستخدم",
			en: "Username"
		},
		password: {
			ar: "كلمة المرور",
			en: "Password"
		},
		name: {
			ar: "الاسم",
			en: "Name"
		},
		submit: {
			ar: "دخول",
			en: "Sign in"
		},
		failed: {
			ar: "تعذر الدخول. تحقق من البيانات.",
			en: "Sign-in failed. Check your details."
		},
		disabled: {
			ar: "تسجيل الدخول غير مفعّل.",
			en: "Sign-in is disabled."
		}
	},
	admin: {
		title: {
			ar: "لوحة الإدارة",
			en: "Admin console"
		},
		org: {
			ar: "المؤسسة",
			en: "Organization"
		},
		orgName: {
			ar: "اسم المنشأة",
			en: "Plant name"
		},
		orgNameAr: {
			ar: "الاسم بالعربية",
			en: "Arabic name"
		},
		users: {
			ar: "المستخدمون",
			en: "Users"
		},
		invites: {
			ar: "الدعوات",
			en: "Invites"
		},
		invite: {
			ar: "إنشاء دعوة",
			en: "Create invite"
		},
		inviteHint: {
			ar: "رمز لمرة واحدة، صالح 7 أيام. لا يتجاوز عدد المقاعد.",
			en: "One-time code, valid 7 days. Cannot exceed seat count."
		},
		code: {
			ar: "رمز الدعوة",
			en: "Invite code"
		},
		remove: {
			ar: "إزالة",
			en: "Remove"
		},
		role: {
			platform: {
				ar: "مالك المنتج",
				en: "Product owner"
			},
			owner: {
				ar: "مالك المنشأة",
				en: "Plant owner"
			},
			admin: {
				ar: "مدير",
				en: "Admin"
			},
			member: {
				ar: "مشغّل",
				en: "Operator"
			}
		},
		plan: {
			trial: {
				ar: "تجريبي",
				en: "Trial"
			},
			plant: {
				ar: "منشأة",
				en: "Plant"
			},
			enterprise: {
				ar: "مؤسسي",
				en: "Enterprise"
			}
		},
		seats: {
			ar: "مقاعد",
			en: "seats"
		},
		seatsUsed: {
			ar: "مستخدم",
			en: "used"
		},
		full: {
			ar: "لا توجد مقاعد متبقية على هذه الخطة.",
			en: "No seats left on this plan."
		},
		usersReadOnly: {
			ar: "إنشاء المستخدمين من لوحة مالك المنتج فقط.",
			en: "Only the product owner can create users."
		}
	},
	platform: {
		title: {
			ar: "لوحة مالك المنتج",
			en: "Product owner console"
		},
		hint: {
			ar: "أنت تنشئ المنشآت والمستخدمين. المشترك يدفع، وأنت تبعث له اسم المستخدم وكلمة المرور.",
			en: "You create plants and users. The subscriber pays; you send them a username and password."
		},
		plants: {
			ar: "المنشآت",
			en: "Plants"
		},
		seatsOpen: {
			ar: "مقاعد متبقية",
			en: "Open seats"
		},
		newPlant: {
			ar: "منشأة جديدة",
			en: "New plant"
		},
		createPlant: {
			ar: "إنشاء المنشأة",
			en: "Create plant"
		},
		plantOk: {
			ar: "تم إنشاء المنشأة",
			en: "Plant created"
		},
		newUser: {
			ar: "مستخدم جديد",
			en: "New user"
		},
		userHint: {
			ar: "اكتب يوزرنيم وباسورد وابعتهما للمشترك. لا يوجد تسجيل ذاتي.",
			en: "Set a username and password and send them to the subscriber. No self-signup."
		},
		createUser: {
			ar: "إنشاء المستخدم",
			en: "Create user"
		},
		userFail: {
			ar: "تعذر الإنشاء. تحقق من اليوزرنيم والمقاعد.",
			en: "Could not create. Check username and seats."
		},
		resetPass: {
			ar: "كلمة مرور جديدة",
			en: "New password"
		}
	},
	locked: {
		title: {
			ar: "لا يوجد حساب مفعّل",
			en: "No provisioned account"
		},
		hint: {
			ar: "الحسابات ينشئها مالك النظام فقط بعد الاشتراك والدفع.",
			en: "Accounts are created only by the product owner after subscription and payment."
		}
	},
	risk: {
		low: {
			ar: "منخفض",
			en: "Low"
		},
		medium: {
			ar: "متوسط",
			en: "Medium"
		},
		high: {
			ar: "مرتفع",
			en: "High"
		},
		critical: {
			ar: "حرج",
			en: "Critical"
		}
	},
	ppe: {
		helmet: {
			ar: "خوذة",
			en: "Helmet"
		},
		vest: {
			ar: "سترة عاكسة",
			en: "Hi-vis vest"
		},
		goggles: {
			ar: "نظارات واقية",
			en: "Goggles"
		},
		gloves: {
			ar: "قفازات",
			en: "Gloves"
		},
		boots: {
			ar: "أحذية سلامة",
			en: "Safety boots"
		},
		mask: {
			ar: "واقي تنفس",
			en: "Respirator"
		},
		ear: {
			ar: "واقي أذن",
			en: "Ear protection"
		},
		harness: {
			ar: "حزام سقوط",
			en: "Fall harness"
		},
		faceshield: {
			ar: "واقي وجه",
			en: "Face shield"
		},
		coverall: {
			ar: "بدلة واقية",
			en: "Coverall"
		},
		hairnet: {
			ar: "شبكة شعر",
			en: "Hairnet"
		},
		labcoat: {
			ar: "بالطو",
			en: "Lab coat"
		},
		facemask: {
			ar: "كمامة",
			en: "Face mask"
		}
	},
	industry: {
		construction: {
			ar: "إنشاءات",
			en: "Construction"
		},
		oilgas: {
			ar: "نفط وغاز",
			en: "Oil & gas"
		},
		chemical: {
			ar: "كيماويات",
			en: "Chemical"
		},
		food: {
			ar: "أغذية",
			en: "Food"
		},
		warehouse: {
			ar: "مستودعات",
			en: "Warehouse"
		},
		welding: {
			ar: "لحام",
			en: "Welding"
		},
		electrical: {
			ar: "كهرباء",
			en: "Electrical"
		},
		mining: {
			ar: "تعدين",
			en: "Mining"
		},
		manufacturing: {
			ar: "تصنيع",
			en: "Manufacturing"
		},
		pharma: {
			ar: "أدوية",
			en: "Pharma"
		},
		hospital: {
			ar: "مستشفى",
			en: "Hospital"
		}
	},
	toast: {
		violation: {
			ar: "مخالفة وقاية",
			en: "PPE violation"
		},
		aiOff: {
			ar: "الذكاء الاصطناعي غير متاح حالياً.",
			en: "AI is unavailable right now."
		},
		aiErr: {
			ar: "تعذر التحليل. أعد المحاولة.",
			en: "Analysis failed. Try again."
		},
		saved: {
			ar: "تم الحفظ",
			en: "Saved"
		},
		briefReady: {
			ar: "تقرير الساعة جاهز للمدير",
			en: "Hourly brief is ready"
		}
	},
	lang: {
		ar: "EN",
		en: "ع"
	}
};
function lookup(path) {
	const parts = path.split(".");
	let cur = dict;
	for (const p of parts) {
		if (!cur || typeof cur !== "object") return void 0;
		cur = cur[p];
	}
	if (cur && typeof cur === "object" && "ar" in cur && "en" in cur) return cur;
}
function t(locale, path) {
	const leaf = lookup(path);
	if (!leaf) return path;
	return leaf[locale];
}
function ppeLabel(locale, id) {
	return t(locale, `ppe.${id}`);
}
function industryLabel(locale, id) {
	return t(locale, `industry.${id}`);
}
function riskLabel(locale, id) {
	return t(locale, `risk.${id}`);
}
function formatDateTime(locale, ts) {
	return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(ts));
}
function formatRelative(locale, ts) {
	const diff = Math.max(0, Date.now() - ts);
	const min = Math.round(diff / 6e4);
	if (min < 1) return locale === "ar" ? "الآن" : "just now";
	if (min < 60) return locale === "ar" ? `منذ ${min} د` : `${min}m ago`;
	const h = Math.round(min / 60);
	if (h < 24) return locale === "ar" ? `منذ ${h} س` : `${h}h ago`;
	const d = Math.round(h / 24);
	return locale === "ar" ? `منذ ${d} ي` : `${d}d ago`;
}
function buildBrief(incidents, from, to) {
	const people = incidents.filter((i) => i.at >= from && i.at < to && i.status !== "closed").map((i) => ({
		cameraId: i.cameraId,
		siteId: i.siteId,
		personId: i.personId,
		missing: i.missing,
		at: i.at
	}));
	return {
		id: uid("brief"),
		from,
		to,
		createdAt: Date.now(),
		status: "ready",
		violationCount: people.length,
		people
	};
}
function briefSubject(brief, locale) {
	const hour = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(brief.from));
	return locale === "ar" ? `تقرير مخالفات الوقاية — ${hour} — ${brief.violationCount} مخالفة` : `PPE hourly brief — ${hour} — ${brief.violationCount} violation(s)`;
}
function briefBody(brief, locale, sites, managerName) {
	const lines = [];
	if (locale === "ar") {
		lines.push(`الأستاذ/ة ${managerName || "مدير السلامة"}،`);
		lines.push("");
		lines.push(brief.violationCount ? `خلال الساعة الماضية سُجّلت ${brief.violationCount} مخالفة معدات وقاية:` : "خلال الساعة الماضية لا توجد مخالفات مفتوحة.");
	} else {
		lines.push(`${managerName || "Safety manager"},`);
		lines.push("");
		lines.push(brief.violationCount ? `${brief.violationCount} PPE violation(s) in the last hour:` : "No open PPE violations in the last hour.");
	}
	lines.push("");
	for (const p of brief.people) {
		const cam = CAMERAS.find((c) => c.id === p.cameraId);
		const site = sites.find((s) => s.id === p.siteId);
		const camName = cam ? locale === "ar" ? cam.nameAr : cam.name : p.cameraId;
		const siteName = site ? locale === "ar" ? site.nameAr : site.name : p.siteId;
		const miss = p.missing.map((m) => ppeLabel(locale, m)).join(", ");
		lines.push(`• ${camName} — ${siteName} — ${p.personId} — ${miss}`);
	}
	lines.push("");
	lines.push(locale === "ar" ? "أيجيس — كشف معدات الوقاية" : "AEGIS — PPE Vision");
	return lines.join("\n");
}
function mailtoHref(email, subject, body) {
	return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
var PLAN_SEATS = {
	trial: 3,
	plant: 15,
	enterprise: 80
};
var PLANS = [
	{
		id: "trial",
		seats: PLAN_SEATS.trial
	},
	{
		id: "plant",
		seats: PLAN_SEATS.plant
	},
	{
		id: "enterprise",
		seats: PLAN_SEATS.enterprise
	}
];
function seatsFor(plan) {
	return PLAN_SEATS[plan] ?? PLAN_SEATS.trial;
}
//#endregion
export { seatsFor as _, WEBCAM as a, briefSubject as c, formatDateTime as d, formatRelative as f, riskLabel as g, ppeLabel as h, SITES as i, buildBrief as l, mailtoHref as m, DEFAULT_CAMERA_RULES as n, applyChecks as o, industryLabel as p, PLANS as r, briefBody as s, CAMERAS as t, cn as u, t as v, uid as y };
