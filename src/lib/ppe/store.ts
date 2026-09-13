import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CAMERAS, DEFAULT_CAMERA_RULES, SITES } from "./demo";
import { applyChecks } from "./checks";
import { buildBrief } from "./hourly";
import { seatsFor } from "./plans";
import {
  saveAckOpen,
  saveBrief,
  saveCameraRule,
  saveIncidentStatus,
  saveOrgSettings,
  saveScanAndIncidents,
  saveSite,
  updateMemberRole,
  updateOrg,
  removeMember,
  createCamera as createCameraFn,
} from "./saas";
import { uid } from "@/lib/utils";
import type {
  AnalysisResult,
  AppSettings,
  CameraFeed,
  CameraRule,
  DirectoryUser,
  HourlyBrief,
  Incident,
  Locale,
  Member,
  Organization,
  PlanId,
  PpeId,
  Role,
  ScanRecord,
  Site,
  WorkspacePayload,
} from "./types";

function seedIncidents(now: number): Incident[] {
  const samples: Array<{
    cam: (typeof CAMERAS)[number];
    hoursAgo: number;
    personId: string;
    status: Incident["status"];
  }> = [];
  for (const cam of CAMERAS) {
    const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
    const violators =
      cam.cached
        ? applyChecks(cam.cached, checks).persons.filter((p) => !p.compliant)
        : [];
    violators.forEach((p, i) => {
      samples.push({
        cam,
        hoursAgo: 0.4 + i * 0.2 + (cam.id.length % 3) * 0.15,
        personId: p.id,
        status: "open",
      });
    });
  }
  const extra = [
    { cam: CAMERAS[0], hoursAgo: 3, personId: "P2", status: "closed" as const },
    { cam: CAMERAS[1], hoursAgo: 5, personId: "P1", status: "ack" as const },
    { cam: CAMERAS[3], hoursAgo: 7, personId: "P1", status: "closed" as const },
    { cam: CAMERAS[5], hoursAgo: 9, personId: "P2", status: "closed" as const },
    { cam: CAMERAS[5], hoursAgo: 11, personId: "P3", status: "ack" as const },
    { cam: CAMERAS[0], hoursAgo: 14, personId: "P2", status: "closed" as const },
    { cam: CAMERAS[3], hoursAgo: 16, personId: "P1", status: "closed" as const },
    { cam: CAMERAS[1], hoursAgo: 18, personId: "P1", status: "closed" as const },
  ];
  return [...samples, ...extra].map((s) => {
    const checks = DEFAULT_CAMERA_RULES[s.cam.id]?.checks ?? [];
    const person = s.cam.cached
      ? applyChecks(s.cam.cached, checks).persons.find((p) => p.id === s.personId)
      : undefined;
    const missing = person?.missing ?? ["helmet"];
    const present = person?.present ?? [];
    const risk = person && !person.compliant ? (s.cam.cached?.risk ?? "high") : "low";
    return {
      id: `inc_${s.cam.id}_${s.personId}_${s.status}_${String(s.hoursAgo).replace(".", "p")}`,
      at: now - s.hoursAgo * 3600_000,
      siteId: s.cam.siteId,
      zoneId: s.cam.zoneId,
      cameraId: s.cam.id,
      personId: s.personId,
      missing,
      present,
      risk,
      summary: s.cam.cached?.summary ?? "PPE missing",
      summaryAr: s.cam.cached?.summaryAr ?? "نقص معدات وقاية",
      status: s.status,
    };
  });
}

function seedScans(now: number): ScanRecord[] {
  return CAMERAS.map((cam, i) => {
    const checks = DEFAULT_CAMERA_RULES[cam.id]?.checks ?? [];
    const result = cam.cached ? applyChecks(cam.cached, checks) : null;
    const persons = result?.persons.length ?? 0;
    const violations = result?.persons.filter((p) => !p.compliant).length ?? 0;
    return {
      id: `scan_${cam.id}`,
      at: now - (i + 1) * 40 * 60_000,
      siteId: cam.siteId,
      zoneId: cam.zoneId,
      cameraId: cam.id,
      source: "sample" as const,
      persons,
      violations,
      risk: result?.risk ?? "low",
      compliance: persons ? (persons - violations) / persons : 1,
    };
  });
}

const now = Math.floor(Date.now() / 60_000) * 60_000;
const seededIncidents = seedIncidents(now);
const firstBrief: HourlyBrief = {
  ...buildBrief(seededIncidents, now - 3600_000, now),
  id: "brief_seed",
  createdAt: now,
};

type State = {
  locale: Locale;
  workspaceReady: boolean;
  org: Organization | null;
  members: Member[];
  plants: Organization[];
  directory: DirectoryUser[];
  role: Role;
  sites: Site[];
  cameras: CameraFeed[];
  activeSiteId: string;
  incidents: Incident[];
  scans: ScanRecord[];
  cameraRules: Record<string, CameraRule>;
  settings: AppSettings;
  briefs: HourlyBrief[];
  setLocale: (locale: Locale) => void;
  hydrateWorkspace: (payload: WorkspacePayload) => void;
  resetWorkspace: () => void;
  setActiveSite: (id: string) => void;
  upsertSite: (site: Site) => void;
  addCamera: (input: {
    name: string;
    nameAr?: string;
    siteId: string;
    zoneId: string;
    rtspUrl?: string;
    checks?: PpeId[];
  }) => Promise<string | null>;
  setSettings: (patch: Partial<AppSettings>) => void;
  setCameraEnabled: (cameraId: string, enabled: boolean) => void;
  toggleCameraCheck: (cameraId: string, ppe: PpeId) => void;
  setCameraChecks: (cameraId: string, checks: PpeId[]) => void;
  recordAnalysis: (input: {
    siteId: string;
    zoneId: string;
    cameraId: string;
    source: ScanRecord["source"];
    result: AnalysisResult;
  }) => void;
  setIncidentStatus: (id: string, status: Incident["status"]) => void;
  ackOpen: () => void;
  generateBrief: (from?: number, to?: number) => HourlyBrief;
  markBriefSent: (id: string) => void;
  patchOrg: (patch: { name?: string; nameAr?: string; plan?: PlanId }) => void;
  changeMemberRole: (userId: string, role: Exclude<Role, "owner" | "platform">) => void;
  dropMember: (userId: string) => void;
};

const defaultSettings: AppSettings = {
  managerName: "مدير السلامة",
  managerEmail: "",
  hourlyEnabled: true,
  lastBriefAt: now,
  detectorUrl: "",
  mailReady: false,
  yoloReady: false,
  ingestReady: false,
};

function persistRule(get: () => State, cameraId: string) {
  if (!get().workspaceReady) return;
  const rule = get().cameraRules[cameraId];
  if (!rule) return;
  void saveCameraRule({ data: { cameraId, enabled: rule.enabled, checks: rule.checks } });
}

export const usePpeStore = create<State>()(
  persist(
    (set, get) => ({
      locale: "ar",
      workspaceReady: false,
      org: null,
      members: [],
      plants: [],
      directory: [],
      role: "member",
      sites: [],
      cameras: [],
      activeSiteId: "",
      incidents: [],
      scans: [],
      cameraRules: {},
      settings: defaultSettings,
      briefs: [],
      setLocale: (locale) => set({ locale }),
      hydrateWorkspace: (payload) =>
        set({
          workspaceReady: true,
          org: payload.org,
          members: payload.members,
          plants: payload.plants,
          directory: payload.directory,
          role: payload.me.role,
          sites: payload.sites,
          cameras: payload.cameras ?? [],
          activeSiteId: payload.sites[0]?.id ?? get().activeSiteId,
          incidents: payload.incidents,
          scans: payload.scans,
          cameraRules: payload.cameraRules ?? {},
          settings: payload.settings,
          briefs: payload.briefs,
        }),
      resetWorkspace: () =>
        set({
          workspaceReady: false,
          org: null,
          members: [],
          plants: [],
          directory: [],
          role: "member",
        }),
      setActiveSite: (id) => set({ activeSiteId: id }),
      upsertSite: (site) => {
        set({
          sites: get().sites.some((s) => s.id === site.id)
            ? get().sites.map((s) => (s.id === site.id ? site : s))
            : [...get().sites, site],
        });
        if (get().workspaceReady) {
          void saveSite({
            data: {
              id: site.id,
              name: site.name,
              nameAr: site.nameAr,
              industry: site.industry,
              city: site.city,
              cityAr: site.cityAr,
              zones: site.zones,
            },
          });
        }
      },
      addCamera: async (input) => {
        try {
          const res = await createCameraFn({
            data: {
              name: input.name,
              nameAr: input.nameAr,
              siteId: input.siteId,
              zoneId: input.zoneId,
              rtspUrl: input.rtspUrl,
              checks: input.checks,
            },
          });
          const id = res.id;
          const cam: CameraFeed = {
            id,
            name: input.name,
            nameAr: input.nameAr || input.name,
            siteId: input.siteId,
            zoneId: input.zoneId,
            image: "",
            kind: input.rtspUrl ? "rtsp" : "live",
            rtspUrl: input.rtspUrl || "",
            enabled: true,
          };
          set({
            cameras: [...get().cameras, cam],
            cameraRules: {
              ...get().cameraRules,
              [id]: { enabled: true, checks: input.checks ?? ["helmet"], rtspUrl: input.rtspUrl || "" },
            },
          });
          return id;
        } catch {
          return null;
        }
      },
      setSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
        if (get().workspaceReady) void saveOrgSettings({ data: patch });
      },
      setCameraEnabled: (cameraId, enabled) => {
        const current =
          get().cameraRules[cameraId] ??
          DEFAULT_CAMERA_RULES[cameraId] ?? { enabled: true, checks: ["helmet"] };
        const checks = Array.isArray(current.checks) ? current.checks : [];
        set({
          cameraRules: {
            ...get().cameraRules,
            [cameraId]: { enabled, checks },
          },
        });
        persistRule(get, cameraId);
      },
      toggleCameraCheck: (cameraId, ppe) => {
        const current =
          get().cameraRules[cameraId] ??
          DEFAULT_CAMERA_RULES[cameraId] ?? {
            enabled: true,
            checks: [],
          };
        const base = Array.isArray(current.checks) ? current.checks : [];
        const has = base.includes(ppe);
        const checks = has ? base.filter((x) => x !== ppe) : [...base, ppe];
        set({
          cameraRules: {
            ...get().cameraRules,
            [cameraId]: { enabled: current.enabled !== false, checks },
          },
        });
        persistRule(get, cameraId);
      },
      setCameraChecks: (cameraId, checks) => {
        const current =
          get().cameraRules[cameraId] ??
          DEFAULT_CAMERA_RULES[cameraId] ?? { enabled: true, checks: [] };
        set({
          cameraRules: {
            ...get().cameraRules,
            [cameraId]: { enabled: current.enabled !== false, checks: [...checks] },
          },
        });
        persistRule(get, cameraId);
      },
      recordAnalysis: ({ siteId, zoneId, cameraId, source, result }) => {
        const persons = result.persons.length;
        const violations = result.persons.filter((p) => !p.compliant).length;
        const scan: ScanRecord = {
          id: uid("scan"),
          at: Date.now(),
          siteId,
          zoneId,
          cameraId,
          source,
          persons,
          violations,
          risk: result.risk,
          compliance: persons ? (persons - violations) / persons : 1,
        };
        const fresh: Incident[] = result.persons
          .filter((p) => !p.compliant)
          .map((p) => ({
            id: uid("inc"),
            at: Date.now(),
            siteId,
            zoneId,
            cameraId,
            personId: p.id,
            missing: p.missing,
            present: p.present,
            risk: result.risk,
            summary: result.summary,
            summaryAr: result.summaryAr,
            status: "open" as const,
          }));
        set({
          scans: [scan, ...get().scans].slice(0, 200),
          incidents: [...fresh, ...get().incidents].slice(0, 400),
        });
        if (get().workspaceReady) {
          void saveScanAndIncidents({ data: { scan, incidents: fresh } });
        }
      },
      setIncidentStatus: (id, status) => {
        set({
          incidents: get().incidents.map((i) => (i.id === id ? { ...i, status } : i)),
        });
        if (get().workspaceReady) void saveIncidentStatus({ data: { id, status } });
      },
      ackOpen: () => {
        set({
          incidents: get().incidents.map((i) =>
            i.status === "open" ? { ...i, status: "ack" } : i,
          ),
        });
        if (get().workspaceReady) void saveAckOpen();
      },
      generateBrief: (from, to) => {
        const end = to ?? Date.now();
        const start = from ?? end - 3600_000;
        const brief = buildBrief(get().incidents, start, end);
        set({
          briefs: [brief, ...get().briefs].slice(0, 48),
          settings: { ...get().settings, lastBriefAt: end },
        });
        if (get().workspaceReady) {
          void saveBrief({
            data: {
              brief: {
                id: brief.id,
                from: brief.from,
                to: brief.to,
                createdAt: brief.createdAt,
                status: brief.status,
                people: brief.people,
              },
            },
          });
        }
        return brief;
      },
      markBriefSent: (id) => {
        const brief = get().briefs.find((b) => b.id === id);
        set({
          briefs: get().briefs.map((b) => (b.id === id ? { ...b, status: "sent" } : b)),
        });
        if (get().workspaceReady && brief) {
          void saveBrief({
            data: {
              brief: {
                id: brief.id,
                from: brief.from,
                to: brief.to,
                createdAt: brief.createdAt,
                status: "sent",
                people: brief.people,
              },
            },
          });
        }
      },
      patchOrg: (patch) => {
        const org = get().org;
        if (!org) return;
        const next = { ...org, ...patch };
        if (patch.plan) next.seats = seatsFor(patch.plan);
        set({ org: next });
        if (get().workspaceReady) void updateOrg({ data: patch });
      },
      changeMemberRole: (userId, role) => {
        set({
          members: get().members.map((m) => (m.userId === userId ? { ...m, role } : m)),
        });
        if (get().workspaceReady) void updateMemberRole({ data: { userId, role } });
      },
      dropMember: (userId) => {
        set({ members: get().members.filter((m) => m.userId !== userId) });
        if (get().workspaceReady) void removeMember({ data: { userId } });
      },
    }),
    {
      name: "aegis-ppe-v4",
      partialize: (s) => ({ locale: s.locale }),
    },
  ),
);

const FALLBACK_RULE: CameraRule = { enabled: true, checks: ["helmet"] };

export function cameraRuleOf(rules: Record<string, CameraRule>, cameraId: string): CameraRule {
  const rule = rules[cameraId] ?? DEFAULT_CAMERA_RULES[cameraId];
  if (rule && Array.isArray(rule.checks)) return rule;
  return FALLBACK_RULE;
}
