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

declare const target_machines: readonly ["3DPrinter", "Sewing", "MachineShop", "Embroidery"];
type TargetMachine = (typeof target_machines)[number];

/**
 * Get all documents in a collection
 */
declare class FirestoreInterface {
    private accessToken;
    private projectId;
    private log_func;
    private error_func;
    constructor(accessToken: string, projectId: string, log_func: (msg: string) => void, error_func: (msg: string) => void);
    static New<T>(projectId: string, auth_json: string, log_func?: (msg: string) => void, error_func?: (msg: string) => void): Promise<FirestoreInterface>;
    getCollection(collection_name: string): Promise<FirestoreDocument[]>;
    /**
     * Get a single document in a collection.
     */
    getDocument(collection_name: string, docID: string): Promise<FirestoreDocument>;
    /**
     * Create a new document in a collection.
     */
    addDocumentInCollection(collection_name: string, { download_url, target_machine, creation_time, uid, name, }: DocumentData): Promise<any>;
    /**
     * Delete a single document in a collection.
     */
    deleteDocumentInCollectionRaw(path: string): Promise<any>;
    /**
     * Delete a single document in a collection.
     */
    deleteDocumentInCollection(collection_name: string, docID: string): Promise<any>;
}

interface JWT {
    access_token: string;
}
declare function IsJWT(value: unknown): value is JWT;
declare function getAccessToken(auth_json: string): Promise<JWT>;

export { FirestoreInterface, IsJWT, JWT, getAccessToken };
