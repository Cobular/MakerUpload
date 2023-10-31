<script lang="ts">
	import type { DocumentData } from 'makersync-common/types';
	import FilesGrid from './FilesGrid.svelte';
	import Header from './Header.svelte';
	import type { Progress } from '$lib/stores/progress_store';

	export let files: DocumentData[];
  export let progress: Progress;
</script>

<div class="w-screen h-screen flex flex-col">
  <Header />
  {#if files.length > 0}
  <div class="overflow-y-scroll overflow-x-clip h-full">
    <FilesGrid {files} {progress} />
  </div>
  {:else}
  <div class="flex-grow flex justify-center items-center">
      <p class="text-5xl font-mono">No files, upload something!</p>
  </div>
  {/if}
</div>

