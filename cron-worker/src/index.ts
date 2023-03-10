/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { FirestoreInterface } from "makersync-common/firestore";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  FILE_CACHE_BUCKET: R2Bucket;
  PREVIEW_FILE_CACHE_BUCKET: R2Bucket;

  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCT_JSON: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // Get a list of all entries in firebase older than 2 minutes
    const firestore = await FirestoreInterface.New(
      env.FIREBASE_PROJECT_ID,
      env.FIREBASE_SERVICE_ACCT_JSON
    );

    const documents = await firestore.getCollection("files");

    console.log("there are " + documents.length + " documents in firebase");

    const now = new Date();

    const docs_to_delete = documents.filter((doc) => {
      const diff = now.getTime() - Date.parse(doc.createTime);
      // 2 minutes ago
      return diff > 1000 * 60 * 2;
    });

    if (docs_to_delete.length === 0) {
      console.log("No documents to delete");
      return;
    }

    // Delete all entries in R2
    const document_ids = docs_to_delete.map(
      (doc) => doc.fields.uid.stringValue
    );
    await env.FILE_CACHE_BUCKET.delete(document_ids);
    await env.PREVIEW_FILE_CACHE_BUCKET.delete(document_ids);
    console.log("Deleted all entries in R2");

    // Delete all entries in firebase
    const document_refs = docs_to_delete.map((doc) => doc.name);
    console.log(
      "Deleting " + document_refs.length + " documents from firebase"
    );

    await Promise.all(
      document_refs.map(async (ref) => {
        try {
          const response = await firestore.deleteDocumentInCollectionRaw(ref);
          console.log("Deleted " + ref);
        } catch (e) {
          console.error(e);
        }
      })
    );
  },
};
