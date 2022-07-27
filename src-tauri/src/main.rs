#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::Error as RequestError;
use rusqlite::{Connection, Error, Result};
use tauri::{CustomMenuItem, Menu /*, MenuItem */, Submenu};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn make_connection() -> Result<(), Error> {
    let conn = Connection::open("cats.db")?;

    conn.execute(
        "create table if not exists cat_colors (
             id integer primary key,
             name text not null unique
         )",
        [],
    )?;
    conn.execute(
        "create table if not exists cats (
             id integer primary key,
             name text not null,
             color_id integer not null references cat_colors(id)
         )",
        [],
    )?;
    return Ok(());
}

#[tauri::command]
fn connect() -> String {
    if let Err(_err) = make_connection() {
        return format!("error");
    }
    format!("connected")
}

async fn get_post_as_string2(url: String) -> Result<serde_json::Value, Box<RequestError>> {
    println!("get_post_as_string2 url:{}", url);
    let s = reqwest::get(&url)
        .await?
        .json::<serde_json::Value>()
        .await?;
    println!("get_post_as_string2:finished");
    Ok(s)
}

// async fn some_other_function(url: String) -> Option<serde_json::Value> {
//     let webapistr = get_post_as_string2(url).await.unwrap();
//     Some(webapistr)
// }

// #[tauri::command]
// async fn testjson(url: String) -> Result<serde_json::Value, String> {
//     let result: Option<serde_json::Value> = some_other_function(url).await;
//     if let Some(message) = result {
//         Ok(message)
//     } else {
//         Err("No result".into())
//     }
// }

#[tauri::command]
async fn testjson(url: String) -> Result<serde_json::Value, String> {
    let result = get_post_as_string2(url).await;
    if let Ok(message) = result {
        Ok(message)
    } else {
        Err("No result".into())
    }
}

fn main() {
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    // let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    // let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let submenu = Submenu::new("File", Menu::new().add_item(close));
    let menu = Menu::new()
        // .add_native_item(MenuItem::Copy)
        // .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            // "quit" => {
            //     std::process::exit(0);
            // }
            "close" => {
                event.window().close().unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![greet, connect, testjson])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
