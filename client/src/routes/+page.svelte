<script lang="ts">
	import { dev } from '$app/environment';
	import MachineSelect from '$lib/components/MachineSelect.svelte';
	import SendButton from '$lib/components/SendButton.svelte';
	import ShowInfo from '$lib/components/ShowInfo.svelte';
	import { umami_event } from '$lib/typescript/old_funcs';
	import { file_upload_machine } from '$lib/typescript/states';
	import FileSelect from '../lib/components/FileSelect.svelte';
	import StepCounter from '../lib/components/StepCounter.svelte';
	import { useMachine } from '@xstate/svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let { state, send } = useMachine(file_upload_machine, {
		logger: (...args) => {
			if (dev) {
				console.log(args[0], { metadata: args[1] });
			} else if (args[0] !== undefined && args[1] !== undefined && typeof args[1] === 'string') {
				// Log with umami
				umami_event(args[0], { metadata: args[1] });
			}
		}
	});
	let turnstile_element: HTMLDivElement;
</script>

<div class="hero min-h-screen bg-base-300">
	<div class="hero-content text-center overflow-clip sm:overflow-visible">
		<div>
			<h1 class="text-5xl font-bold">MakerSync</h1>
			<p class="py-6 pb-10">Send files to makerspace computers!</p>
			<div class="card bg-base-100 shadow-xl m-5 relative">
				<div
					class="absolute top-0 right-0 translate-x-6 sm:translate-x-1/3 translate-y-[-70%] sm:translate-y-[-50%] rotate-12  tooltip tooltip-top"
					data-tip="Just pick multiple files when prompted, or drop them in the box!"
				>
					<p
						class="font-minecraft text-xs bg-yellow-100 drop-shadow-md rounded-lg p-3 py-2 pb-4 pt-2 z-10 animate-bounce text-slate-900						"
					>
						{@html data.text}
					</p>
				</div>
				<div class="card-body max-w-sm w-screen gap-4">
					<StepCounter
						state={$state}
						{send}
						on:click_file={() => send('BACK_TO_SELECT_FILES')}
						on:click_target={() => {
							send('BACK_TO_SELECT_MACHINE');
						}}
					/>

					<ShowInfo state={$state} />

					{#if $state.matches('select_files')}
						<FileSelect
							on:file_choose={(files) => {
								send({ type: 'FILE_SELECT', files: files.detail.files });
							}}
						/>
					{:else if $state.matches('select_machine')}
						<MachineSelect
							on:select_choose={(select) => {
								send({ type: 'MACHINE_SELECT', target: select.detail.machine });
							}}
						/>
					{:else if $state.matches('upload')}
						<div bind:this={turnstile_element} />

						{#if $state.matches({ upload: 'waiting' }) || $state.matches({ upload: 'validating' })}
							<SendButton
								on:send={() => {
									send({ type: 'UPLOAD_START', turnstile_elem: turnstile_element });
								}}
								enabled={$state.matches({ upload: 'waiting' })}
							/>
						{:else if $state.matches({ upload: 'compressing' })}
							<progress
								class="progress progress-secondary"
								value={$state.context.progress}
								max="100"
							/>
						{:else if $state.matches({ upload: 'uploading' })}
							<progress
								class="progress progress-primary"
								value={$state.context.progress}
								max="100"
							/>
						{:else if $state.matches({ upload: 'upload_error' })}
							<progress class="progress progress-error" value={100} max="100" />
							<p class="text-center text-red-500">{$state.context.error}</p>
						{/if}
					{:else if $state.matches('done')}
						<button
							class="btn btn-success"
							on:click={() => send('BACK_TO_SELECT_FILES')}
							on:keydown={() => send('BACK_TO_SELECT_FILES')}
						>
							Upload More
						</button>
						<button
							class="btn btn-outline btn-secondary"
							on:click={() => send('BACK_TO_SELECT_MACHINE')}
							on:keydown={() => send('BACK_TO_SELECT_MACHINE')}
						>
							Change Machine
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
