<script lang="ts">
	import { FirestoreReadable } from '$lib/firestore';
	import { collection, CollectionReference, query, type DocumentChange } from 'firebase/firestore';
	import { readable, writable, type Readable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { firestore } from '../lib/firebase';
	import type { DocumentData } from 'makersync-common/types';
	import { this_machine_store } from '$lib/stores/this_machine_store';
	import { download_file } from '$lib/utils';
	import FloatingQr from '$lib/components/FloatingQR.svelte';
	import { slide } from 'svelte/transition';
	import { prevent_close } from '$lib/prevent_close';
	import { emit, listen } from '@tauri-apps/api/event';

	import { trace, info, error, attachConsole } from 'tauri-plugin-log-api';
	import Main from '$lib/components/Main.svelte';
	import type { AlertData } from '$lib/types';
	import { hover_store } from '$lib/stores/hover_store';
	import DragDropOverlay from '$lib/components/DragDropOverlay.svelte';
	import type { Progress } from '$lib/stores/progress_store';

	const files_ref = query<DocumentData>(
		collection(firestore, '/files') as unknown as CollectionReference<DocumentData>
	);

	let files_store: Readable<DocumentData[]> = readable([]);
	let progress_store: Readable<Progress> = writable(undefined);

	let alerts: AlertData[] = [];

	function document_change_handler(snapshot: DocumentChange<DocumentData>) {
		if (snapshot.type !== 'added') return;

		const doc = snapshot.doc;

		info(`${doc.data().name}|${doc.data().download_url}`);

		// If the file type matches this_machine_store, automatically download it
		if (doc.data().target_machine === $this_machine_store) {
			alerts = [
				...alerts,
				{
					message: `Downloading ${doc.data().name}`,
					level: 'info',
					key: doc.id
				}
			];
			setTimeout(() => {
				alerts = alerts.filter((alert) => alert.key !== doc.id);
			}, 5000);
			download_file(doc.data().download_url, doc.data().name);
		}
	}

	onMount(async () => {
		// with LogTarget::Webview enabled this function will print logs to the browser console
		const detach = await attachConsole();
		prevent_close();
		const files = await FirestoreReadable.new<DocumentData>(files_ref);
		files.register_change_handler(document_change_handler);
		files_store = files;

		// Once every 4 hours, check for an update
		const update_interval = setInterval(async function () {
			await emit('tauri://update');
		}, 4 * 60 * 60 * 1000); // 4 hours in milliseconds

		// listen to the `click` event and get a function to remove the event listener
		// there's also a `once` function that subscribes to an event and automatically unsubscribes the listener on the first event
		const unlisten = await listen('download-status', (event) => {
			$progress_store = event.payload;
		});

		return () => {
			detach();
			clearInterval(update_interval);
			unlisten();
		};
	});
</script>

<Main files={$files_store} progress={$progress_store} />
<FloatingQr />

<div class="toast toast-start">
	{#each alerts as alert (alert.key)}
		<div in:slide out:slide class="alert alert-{alert.level}">
			{alert.message}
		</div>
	{/each}
</div>
