import type { AnalysisResult, CameraFeed, CameraRule, Site } from "./types";

export const SITES: Site[] = [
  {
    id: "cairo-east",
    name: "Cairo East Construction",
    nameAr: "موقع القاهرة الشرقية",
    industry: "construction",
    city: "Cairo",
    cityAr: "القاهرة",
    zones: [
      {
        id: "gate",
        name: "Main gate",
        nameAr: "البوابة الرئيسية",
        required: ["helmet", "vest", "boots", "goggles"],
      },
      {
        id: "scaffold-a",
        name: "Scaffold A",
        nameAr: "سقالة أ",
        required: ["helmet", "vest", "boots", "harness", "goggles"],
      },
    ],
  },
  {
    id: "suez-chem",
    name: "Suez Petrochemical Complex",
    nameAr: "مجمع السويس للبتروكيماويات",
    industry: "chemical",
    city: "Suez",
    cityAr: "السويس",
    zones: [
      {
        id: "process",
        name: "Process catwalk",
        nameAr: "ممر العمليات",
        required: ["goggles", "gloves", "mask", "boots", "coverall"],
      },
    ],
  },
  {
    id: "oct-wh",
    name: "6th of October Warehouse",
    nameAr: "مخازن 6 أكتوبر",
    industry: "warehouse",
    city: "6th of October",
    cityAr: "6 أكتوبر",
    zones: [
      {
        id: "aisle-4",
        name: "Aisle 4",
        nameAr: "ممر 4",
        required: ["vest", "boots", "gloves"],
      },
    ],
  },
  {
    id: "tenth-weld",
    name: "10th of Ramadan Welding Bay",
    nameAr: "ورشة اللحام — العاشر من رمضان",
    industry: "welding",
    city: "10th of Ramadan",
    cityAr: "العاشر من رمضان",
    zones: [
      {
        id: "bay-2",
        name: "Bay 2",
        nameAr: "الحوض 2",
        required: ["faceshield", "gloves", "boots", "coverall"],
      },
    ],
  },
  {
    id: "helwan-steel",
    name: "Helwan Steel Mill",
    nameAr: "مصنع حلوان للصلب",
    industry: "manufacturing",
    city: "Helwan",
    cityAr: "حلوان",
    zones: [
      {
        id: "line-3",
        name: "Line 3",
        nameAr: "خط 3",
        required: ["helmet", "vest", "goggles", "gloves", "boots"],
      },
    ],
  },
  {
    id: "nasser-hospital",
    name: "Nasser Medical Complex",
    nameAr: "مجمع ناصر الطبي",
    industry: "hospital",
    city: "Cairo",
    cityAr: "القاهرة",
    zones: [
      {
        id: "ward-b",
        name: "Ward B",
        nameAr: "عنبر ب",
        required: ["labcoat", "facemask", "gloves", "hairnet"],
      },
    ],
  },
  {
    id: "giza-pharma",
    name: "Giza Pharma Fill Line",
    nameAr: "خط التعبئة — أدوية الجيزة",
    industry: "pharma",
    city: "Giza",
    cityAr: "الجيزة",
    zones: [
      {
        id: "clean-2",
        name: "Clean room 2",
        nameAr: "غرفة نظيفة 2",
        required: ["labcoat", "facemask", "gloves", "goggles", "hairnet"],
      },
    ],
  },
];

const gate: AnalysisResult = {
  scene: "Construction gate, two workers approaching",
  risk: "high",
  summary: "1 of 2 workers missing a hard hat.",
  summaryAr: "عامل من اثنين بدون خوذة.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.16, y: 0.26, w: 0.26, h: 0.7 },
      present: ["helmet", "vest", "goggles", "gloves", "boots"],
      missing: [],
      confidence: 0.94,
      compliant: true,
    },
    {
      id: "P2",
      bbox: { x: 0.5, y: 0.3, w: 0.26, h: 0.66 },
      present: ["vest", "gloves", "boots"],
      missing: ["helmet", "goggles"],
      confidence: 0.91,
      compliant: false,
      notes: "Phone in hand, no helmet",
    },
  ],
};

const scaffold: AnalysisResult = {
  scene: "Elevated scaffold, worker at height",
  risk: "critical",
  summary: "Worker at height with no fall-arrest harness.",
  summaryAr: "عامل على ارتفاع بدون حزام سقوط.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.34, y: 0.3, w: 0.26, h: 0.44 },
      present: ["helmet", "boots"],
      missing: ["harness", "vest", "goggles"],
      confidence: 0.88,
      compliant: false,
      notes: "Work at height — harness required",
    },
  ],
};

const process: AnalysisResult = {
  scene: "Chemical process catwalk",
  risk: "low",
  summary: "Worker in full chemical PPE.",
  summaryAr: "العامل بكامل معدات الوقاية الكيميائية.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.6, y: 0.16, w: 0.24, h: 0.74 },
      present: ["coverall", "mask", "goggles", "gloves", "boots"],
      missing: [],
      confidence: 0.93,
      compliant: true,
    },
  ],
};

const warehouse: AnalysisResult = {
  scene: "Warehouse aisle with forklift traffic",
  risk: "high",
  summary: "Worker in traffic aisle without a hi-vis vest.",
  summaryAr: "عامل في ممر الحركة بدون سترة عاكسة.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.16, y: 0.2, w: 0.24, h: 0.72 },
      present: ["boots"],
      missing: ["vest", "gloves"],
      confidence: 0.9,
      compliant: false,
      notes: "Sneakers, no hi-vis",
    },
  ],
};

const weld: AnalysisResult = {
  scene: "Welding bay with active arc",
  risk: "low",
  summary: "Welder using helmet, gloves, apron and boots.",
  summaryAr: "اللحّام يستخدم خوذة اللحام والقفازات والمريلة والأحذية.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.14, y: 0.2, w: 0.42, h: 0.7 },
      present: ["faceshield", "gloves", "coverall", "boots"],
      missing: [],
      confidence: 0.92,
      compliant: true,
    },
  ],
};

const floor: AnalysisResult = {
  scene: "Production floor, three workers",
  risk: "high",
  summary: "2 of 3 workers missing required PPE.",
  summaryAr: "عاملان من ثلاثة ينقصهم معدات مطلوبة.",
  persons: [
    {
      id: "P1",
      bbox: { x: 0.0, y: 0.26, w: 0.2, h: 0.7 },
      present: ["helmet", "vest", "goggles", "gloves", "boots"],
      missing: [],
      confidence: 0.9,
      compliant: true,
    },
    {
      id: "P2",
      bbox: { x: 0.38, y: 0.28, w: 0.22, h: 0.68 },
      present: ["vest", "gloves", "boots"],
      missing: ["helmet", "goggles"],
      confidence: 0.89,
      compliant: false,
    },
    {
      id: "P3",
      bbox: { x: 0.74, y: 0.26, w: 0.22, h: 0.7 },
      present: ["helmet", "boots"],
      missing: ["vest", "goggles", "gloves"],
      confidence: 0.87,
      compliant: false,
    },
  ],
};

export const CAMERAS: CameraFeed[] = [
  {
    id: "cam-gate",
    name: "CAM-01 Gate",
    nameAr: "كام-01 البوابة",
    siteId: "cairo-east",
    zoneId: "gate",
    image: "/demo/cam-gate.jpg",
    kind: "sample",
    cached: gate,
  },
  {
    id: "cam-scaffold",
    name: "CAM-02 Scaffold A",
    nameAr: "كام-02 سقالة أ",
    siteId: "cairo-east",
    zoneId: "scaffold-a",
    image: "/demo/cam-scaffold.jpg",
    kind: "sample",
    cached: scaffold,
  },
  {
    id: "cam-process",
    name: "CAM-03 Process",
    nameAr: "كام-03 العمليات",
    siteId: "suez-chem",
    zoneId: "process",
    image: "/demo/cam-process.jpg",
    kind: "sample",
    cached: process,
  },
  {
    id: "cam-warehouse",
    name: "CAM-04 Aisle 4",
    nameAr: "كام-04 ممر 4",
    siteId: "oct-wh",
    zoneId: "aisle-4",
    image: "/demo/cam-warehouse.jpg",
    kind: "sample",
    cached: warehouse,
  },
  {
    id: "cam-weld",
    name: "CAM-05 Bay 2",
    nameAr: "كام-05 الحوض 2",
    siteId: "tenth-weld",
    zoneId: "bay-2",
    image: "/demo/cam-weld.jpg",
    kind: "sample",
    cached: weld,
  },
  {
    id: "cam-floor",
    name: "CAM-06 Line 3",
    nameAr: "كام-06 خط 3",
    siteId: "helwan-steel",
    zoneId: "line-3",
    image: "/demo/cam-floor.jpg",
    kind: "sample",
    cached: floor,
  },
  {
    id: "cam-ward",
    name: "CAM-07 Ward B",
    nameAr: "كام-07 عنبر ب",
    siteId: "nasser-hospital",
    zoneId: "ward-b",
    image: "/demo/cam-process.jpg",
    kind: "sample",
    cached: process,
  },
];

export const WEBCAM: CameraFeed = {
  id: "webcam",
  name: "CAM-00 Live",
  nameAr: "كام-00 مباشرة",
  siteId: "cairo-east",
  zoneId: "gate",
  image: "",
  kind: "webcam",
};

export const DEFAULT_CAMERA_RULES: Record<string, CameraRule> = {
  "cam-gate": { enabled: true, checks: ["helmet"] },
  "cam-scaffold": { enabled: true, checks: ["helmet", "harness"] },
  "cam-process": { enabled: true, checks: ["mask", "goggles", "gloves"] },
  "cam-warehouse": { enabled: true, checks: ["vest"] },
  "cam-weld": { enabled: true, checks: ["faceshield", "gloves"] },
  "cam-floor": { enabled: true, checks: ["helmet", "vest"] },
  "cam-ward": { enabled: true, checks: ["labcoat", "facemask"] },
  webcam: { enabled: true, checks: ["helmet", "vest"] },
};

