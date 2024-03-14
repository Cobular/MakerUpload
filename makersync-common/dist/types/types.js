'use strict';

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

exports.IsDocument = IsDocument;
exports.IsFirestoreDocument = IsFirestoreDocument;
exports.IsFirestoreDocumentList = IsFirestoreDocumentList;
exports.IsRawDocument = IsRawDocument;
exports.IsTargetMachine = IsTargetMachine;
exports.target_machines = target_machines;
//# sourceMappingURL=types.js.map
