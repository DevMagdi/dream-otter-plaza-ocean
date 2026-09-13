import type { IndustryId, PpeId } from "./types";

export const PPE_CATALOG: PpeId[] = [
  "helmet",
  "vest",
  "goggles",
  "gloves",
  "boots",
  "mask",
  "facemask",
  "ear",
  "harness",
  "faceshield",
  "coverall",
  "labcoat",
  "hairnet",
];

export const INDUSTRIES: Record<
  IndustryId,
  { required: PpeId[]; hazards: string }
> = {
  construction: {
    required: ["helmet", "vest", "boots", "goggles"],
    hazards: "fall,impact,dust",
  },
  oilgas: {
    required: ["helmet", "vest", "goggles", "gloves", "boots", "mask"],
    hazards: "fire,h2s,pressure",
  },
  chemical: {
    required: ["goggles", "gloves", "mask", "boots", "coverall"],
    hazards: "splash,vapor,toxic",
  },
  food: {
    required: ["hairnet", "gloves", "boots", "coverall"],
    hazards: "hygiene,slip",
  },
  warehouse: {
    required: ["vest", "boots", "gloves"],
    hazards: "vehicle,crush",
  },
  welding: {
    required: ["faceshield", "gloves", "boots", "coverall"],
    hazards: "arc,spark,fume",
  },
  electrical: {
    required: ["helmet", "goggles", "gloves", "boots"],
    hazards: "shock,arc-flash",
  },
  mining: {
    required: ["helmet", "vest", "boots", "goggles", "ear"],
    hazards: "collapse,dust,noise",
  },
  manufacturing: {
    required: ["helmet", "vest", "goggles", "gloves", "boots"],
    hazards: "machine,cut,noise",
  },
  pharma: {
    required: ["labcoat", "facemask", "gloves", "goggles", "hairnet"],
    hazards: "sterile,chemical",
  },
  hospital: {
    required: ["labcoat", "facemask", "gloves", "hairnet"],
    hazards: "infection,splash",
  },
};

export function defaultRequired(industry: IndustryId): PpeId[] {
  return [...INDUSTRIES[industry].required];
}
