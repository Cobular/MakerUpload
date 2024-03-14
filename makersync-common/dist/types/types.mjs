function IsDocument(value) {
  return typeof value === "object" && value !== null && "creation_time" in value && "download_url" in value;
}
function IsRawDocument(value) {
  return typeof value === "object" && value !== null && "creation_time" in value && "download_url" in value && "target_machine" in value;
}
function IsFirestoreDocument(value) {
  return typeof value === "object" && value !== null && "name" in value && "fields" in value && IsRawDocument(value.fields);
}
function IsFirestoreDocumentList(value) {
  return Array.isArray(value) && value.every((item) => IsFirestoreDocument(item));
}

const target_machines = ["3DPrinter", "Sewing", "MachineShop", "Embroidery"];
function IsTargetMachine(value) {
  return typeof value === "string" && target_machines.includes(value);
}

export { IsDocument, IsFirestoreDocument, IsFirestoreDocumentList, IsRawDocument, IsTargetMachine, target_machines };
//# sourceMappingURL=types.mjs.map
