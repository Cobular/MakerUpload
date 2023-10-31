use tauri::{AppHandle, Manager};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct DownloadStatusPayload {
    file_name: String,
    progress: f32,
}

pub fn send_event(app: &AppHandle, file_name: &str, total_size: u64, progress: u64) {
    let payload = DownloadStatusPayload {
        file_name: file_name.to_string(),
        progress: (progress as f32 / total_size as f32) * 100.0,
    };
    app.emit_all("download-status", Some(payload))
        .expect("failed to emit event");
}
