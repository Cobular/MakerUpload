interface DocumentData {
    creation_time: Date;
    download_url: string;
    target_machine: TargetMachine;
    name: string;
    uid: string;
}
interface RawDocumentData {
    creation_time: {
        timestampValue: string;
    };
    download_url: {
        stringValue: string;
    };
    target_machine: {
        stringValue: TargetMachine;
    };
    uid: {
        stringValue: string;
    };
    name: {
        stringValue: string;
    };
}
interface FirestoreDocument {
    name: string;
    fields: RawDocumentData;
    createTime: string;
    updateTime?: string;
}
declare function IsDocument(value: unknown): value is DocumentData;
declare function IsRawDocument(value: unknown): value is RawDocumentData;
declare function IsFirestoreDocument(value: unknown): value is FirestoreDocument;
declare function IsFirestoreDocumentList(value: unknown): value is FirestoreDocument[];

declare const target_machines: readonly ["3DPrinter", "Sewing", "MachineShop", "Embroidery"];
type TargetMachine = (typeof target_machines)[number];
declare function IsTargetMachine(value: unknown): value is TargetMachine;

export { DocumentData, FirestoreDocument, IsDocument, IsFirestoreDocument, IsFirestoreDocumentList, IsRawDocument, IsTargetMachine, RawDocumentData, TargetMachine, target_machines };
