import {
  Ear,
  Footprints,
  Glasses,
  Hand,
  HardHat,
  Shirt,
  Shield,
  UserRound,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { PpeId } from "@/lib/ppe/types";

const MAP: Record<PpeId, LucideIcon> = {
  helmet: HardHat,
  vest: Shirt,
  goggles: Glasses,
  gloves: Hand,
  boots: Footprints,
  mask: Wind,
  facemask: Wind,
  ear: Ear,
  harness: Shield,
  faceshield: Shield,
  coverall: Shirt,
  labcoat: Shirt,
  hairnet: UserRound,
};

export function PpeIcon({ id, className }: { id: PpeId; className?: string }) {
  const Icon = MAP[id];
  return <Icon className={className} strokeWidth={1.75} />;
}
