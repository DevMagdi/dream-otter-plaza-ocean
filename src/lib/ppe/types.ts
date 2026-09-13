export type Locale = "ar" | "en";

export type PpeId =
  | "helmet"
  | "vest"
  | "goggles"
  | "gloves"
  | "boots"
  | "mask"
  | "ear"
  | "harness"
  | "faceshield"
  | "coverall"
  | "hairnet"
  | "labcoat"
  | "facemask";

export type IndustryId =
  | "construction"
  | "oilgas"
  | "chemical"
  | "food"
  | "warehouse"
  | "welding"
  | "electrical"
  | "mining"
  | "manufacturing"
  | "pharma"
  | "hospital";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type BBox = { x: number; y: number; w: number; h: number };

export type PersonDetection = {
  id: string;
  bbox: BBox;
  present: PpeId[];
  missing: PpeId[];
  confidence: number;
  compliant: boolean;
  notes?: string;
};

export type AnalysisResult = {
  persons: PersonDetection[];
  scene: string;
  risk: RiskLevel;
  summary: string;
  summaryAr: string;
};

export type Zone = {
  id: string;
  name: string;
  nameAr: string;
  required: PpeId[];
};

export type Site = {
  id: string;
  name: string;
  nameAr: string;
  industry: IndustryId;
  city: string;
  cityAr: string;
  zones: Zone[];
};

export type CameraFeed = {
  id: string;
  name: string;
  nameAr: string;
  siteId: string;
  zoneId: string;
  image: string;
  kind: "sample" | "webcam" | "live" | "rtsp";
  cached?: AnalysisResult;
  rtspUrl?: string;
  enabled?: boolean;
};

export type CameraRule = {
  enabled: boolean;
  checks: PpeId[];
  rtspUrl?: string;
};

export type Incident = {
  id: string;
  at: number;
  siteId: string;
  zoneId: string;
  cameraId: string;
  personId: string;
  missing: PpeId[];
  present: PpeId[];
  risk: RiskLevel;
  summary: string;
  summaryAr: string;
  status: "open" | "ack" | "closed";
  thumbnail?: string;
};

export type ScanRecord = {
  id: string;
  at: number;
  siteId: string;
  zoneId: string;
  cameraId: string;
  source: "sample" | "ai" | "webcam" | "upload" | "yolo";
  persons: number;
  violations: number;
  risk: RiskLevel;
  compliance: number;
};

export type HourlyBrief = {
  id: string;
  from: number;
  to: number;
  createdAt: number;
  status: "ready" | "sent";
  violationCount: number;
  people: Array<{
    cameraId: string;
    siteId: string;
    personId: string;
    missing: PpeId[];
    at: number;
  }>;
};

export type AppSettings = {
  managerName: string;
  managerEmail: string;
  hourlyEnabled: boolean;
  lastBriefAt: number;
  detectorUrl: string;
  mailReady: boolean;
  yoloReady: boolean;
  ingestReady: boolean;
};

export type Role = "platform" | "owner" | "admin" | "member";
export type PlanId = "trial" | "plant" | "enterprise";

export type Organization = {
  id: string;
  name: string;
  nameAr: string;
  plan: PlanId;
  seats: number;
  usedSeats: number;
  kind: "platform" | "plant";
};

export type Member = {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
};

export type DirectoryUser = Member & {
  orgId: string;
  orgName: string;
  locked: boolean;
};

export type WorkspacePayload = {
  org: Organization;
  members: Member[];
  me: Member;
  plants: Organization[];
  directory: DirectoryUser[];
  sites: Site[];
  cameras: CameraFeed[];
  cameraRules: Record<string, CameraRule>;
  incidents: Incident[];
  scans: ScanRecord[];
  settings: AppSettings;
  briefs: HourlyBrief[];
};

