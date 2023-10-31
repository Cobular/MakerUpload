use std::path::Path;

use futures_util::StreamExt;
use log::{error, info};
use std::io::Cursor;
use tauri::{api::path::download_dir, AppHandle};
use tokio::{
    fs::File,
    io::{copy, AsyncWriteExt},
};

use crate::events::download_status::send_event;

#[tauri::command]
pub async fn download_file(app: AppHandle, url: String, filename: String) -> Result<u64, String> {
    // Put the file in the user's document directory
    let file_name = download_dir().unwrap().join(Path::new(&filename));
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let mut out = File::create(file_name).await.map_err(|e| e.to_string())?;
    let expected_len = resp.content_length().unwrap_or(0);
    info!(
        "Downloading {} to {}, size {:?}",
        url,
        filename,
        resp.content_length()
    );

    if resp.status() != reqwest::StatusCode::OK {
        error!("Download failed: {}", resp.status());
        return Err(format!("Download failed: {}", resp.status()));
    }

    let mut stream = resp.bytes_stream();
    let mut downloaded: u64 = 0;

    while let Some(item) = stream.next().await {
        let chunk = item.or(Err("Error while downloading file".to_string()))?;
        out.write_all(&chunk)
            .await
            .or(Err("Error while writing to file".to_string()))?;
        downloaded += chunk.len() as u64;
        send_event(&app, &filename, expected_len, downloaded)
    }
    info!("Downloaded {} bytes", downloaded);

    if downloaded != expected_len {
        error!("Downloaded {} bytes, expected {}", downloaded, expected_len);
        return Err(format!(
            "Downloaded {} bytes, expected {}",
            downloaded, expected_len
        ));
    }

    Ok(downloaded)
}
