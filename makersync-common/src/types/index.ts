export * from "./firestore"

export const target_machines = ["3DPrinter", "Sewing", "MachineShop", "Embroidery"] as const;

export type TargetMachine = (typeof target_machines)[number];

export function IsTargetMachine(value: unknown): value is TargetMachine {
  return (
    typeof value === "string" &&
    target_machines.includes(value as unknown as TargetMachine)
  );
}
