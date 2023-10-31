<script lang="ts">
	import type { DocumentData } from "makersync-common/types";
	import File from "./File.svelte";
	import type { Progress } from "$lib/stores/progress_store";

  export let files: DocumentData[];
  export let progress: Progress;

  function sorting(a: DocumentData,b: DocumentData) {
    return a.creation_time.toDate().getTime() - b.creation_time.toDate().getTime();
  }
</script>

<div class="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-3 p-4">
  {#each files.sort(sorting).reverse() as file}
     <File {file} {progress} />
  {/each}
</div>