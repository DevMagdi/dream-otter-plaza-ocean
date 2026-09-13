import type { PlanId } from "./types";

export const PLAN_SEATS: Record<PlanId, number> = {
  trial: 3,
  plant: 15,
  enterprise: 80,
};

export const PLANS: Array<{
  id: PlanId;
  seats: number;
}> = [
  { id: "trial", seats: PLAN_SEATS.trial },
  { id: "plant", seats: PLAN_SEATS.plant },
  { id: "enterprise", seats: PLAN_SEATS.enterprise },
];

export function seatsFor(plan: PlanId): number {
  return PLAN_SEATS[plan] ?? PLAN_SEATS.trial;
}
