#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use crate::commands::download::download_file;
use tauri::Manager;
use tauri_plugin_log::LogTarget;
use window_shadows::set_shadow;

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![download_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
