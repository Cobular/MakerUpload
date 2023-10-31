import * as zip from '@zip.js/zip.js';
import type { OnProgress } from './types';

zip.configure({
	useWebWorkers: true,
	useCompressionStream: true
});


export async function compress_files(files: File[], onProgress: OnProgress, compression_level = 5): Promise<Blob> {
  const zipWriter = new zip.ZipWriter(new zip.BlobWriter('application/zip'), {
		level: compression_level,
		bufferedWrite: true,
	});

  const total_size = files.reduce((acc, file) => acc + file.size, 0);

  function make_tuple(file: File): [File, number] {
    return [file, file.size/total_size];
  }


	await Promise.all(
		files.map(make_tuple).map(async ([file, ratio]) => {
			await zipWriter.add(file.name, new zip.BlobReader(file), {
        onprogress: async (current_bytes) => {
          const progress = Math.round((current_bytes * ratio) / total_size * 100);
          onProgress(progress);
        }
      });
		})
	);
	return await zipWriter.close();
}
