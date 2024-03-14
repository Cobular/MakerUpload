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
import { Toucan } from "toucan-js";

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
  SENTRY_DSN: string;
}

async function handler(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
) {
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
  const document_ids = docs_to_delete.map((doc) => doc.fields.uid.stringValue);
  await env.FILE_CACHE_BUCKET.delete(document_ids);
  await env.PREVIEW_FILE_CACHE_BUCKET.delete(document_ids);
  console.log("Deleted all entries in R2");

  // Delete all entries in firebase
  let document_refs = docs_to_delete.map((doc) => doc.name);
  console.log("There are " + document_refs.length + " documents to delete");
  if (document_refs.length > 20) {
    console.log("Only deleting first 20 documents");
    document_refs = document_refs.slice(0, 20);
  }

  console.log("Deleting " + document_refs.length + " documents from firebase");

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
}

const headers = {
  Authorization:
    `DSN https://bac4d51d022046fb8e5411656a8fbbc3@o4504879295627264.ingest.us.sentry.io/4504879441969152`,
  'Content-Type': 'application/json; charset=UTF-8',
};
const monitor_id = "526026b2-88c3-45fa-9726-bba84b061761"; // Write your monitor_id here
const org_slug = "ucla-makerspace"; // Write your organization slug here

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("HANDLER")
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      release: "1.0.0",
      context: ctx,
    });


    try {
      // CRON MANAGEMENT BROKE :(
      
      // Create the check-in
      // var startDate = new Date();
      // const json_data = { status: "in_progress" };
      // const create_checkin_response = await fetch(
      //   `https://sentry.io/api/0/organizations/${org_slug}/monitors/${monitor_id}/checkins/`,
      //   {
      //     method: "POST",
      //     headers: headers,
      //     body: JSON.stringify(json_data),
      //   }
      // );

      // if (!create_checkin_response.ok) {
      //   console.error("Error checking into sentry! Code:", create_checkin_response.status, await create_checkin_response.text());
      //   throw new Error(
      //     `HTTP error! Status: ${create_checkin_response.status}`
      //   );
      // }

      await handler(controller, env, ctx);

      // var endDate = new Date();
      // const update_data = {
      //   status: "ok",
      //   duration: endDate.getTime() - startDate.getTime(),
      // };
      // const update_checkin_response = await fetch(
      //   `https://sentry.io/api/0/organizations/${org_slug}/monitors/${monitor_id}/checkins/latest/`,
      //   {
      //     method: "PUT",
      //     headers: headers,
      //     body: JSON.stringify(update_data),
      //   }
      // );
    } catch (e) {
      sentry.captureException(e);
    }
  },
};
