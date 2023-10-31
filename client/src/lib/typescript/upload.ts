import type { TargetMachine } from 'makersync-common/types';
import { BASE_URL } from './base_url';
import axios from 'axios';
import type { OnProgress } from './types';

export async function upload_file(
	file: File,
	target_machine: TargetMachine,
	token: string,
	on_progress: OnProgress
): Promise<void> {
	const dest_url =
		BASE_URL +
		new URLSearchParams({
			target_machine: target_machine,
			file_name: file.name,
			token: token
		});

	const totalBytes = file.size;

	await axios.put(dest_url, file, {
		onUploadProgress: (progressEvent) => {
			const progress = Math.round((progressEvent.loaded / totalBytes) * 100);
			console.log(progress);
			
			on_progress(progress);
		}
	})
}
