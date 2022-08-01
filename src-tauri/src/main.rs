#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::Error as RequestError;
use rusqlite::{Connection, Error, Result};
use serde_json::json;
use tauri::{CustomMenuItem, Menu /*, MenuItem */, Submenu};

#[derive(Debug)]
struct Cat {
    id: i32,
    name: String,
}

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

    conn.execute(
        "create table if not exists cattest (
             id integer primary key,
             name text not null
         )",
        [],
    )?;
    return Ok(());
}

fn add_cat() -> Result<(), Error> {
    let conn = Connection::open("cats.db")?;

    conn.execute(
        "insert into cattest (name)
         values('test cat 1')
        ",
        [],
    )?;
    Ok(())
}

fn get_cats() -> Result<serde_json::Value, Error> {
    let conn = Connection::open("cats.db")?;

    let mut stmt = conn.prepare("SELECT c.id, c.name from cattest c")?;

    let cats = stmt.query_map([], |row| {
        Ok(Cat {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut vec = Vec::new();
    for cat in cats {
        println!("Found cat {:?}", cat);
        if let Ok(c) = cat {
            vec.push(json!({
                "id": c.id,
                "name": c.name,
            }));
        }
    }

    // Ok(Value::Object(map))
    Ok(json!(vec))
}

#[tauri::command]
async fn getcats() -> Result<serde_json::Value, String> {
    let result = get_cats();
    if let Ok(message) = result {
        Ok(message)
    } else {
        Err("No result".into())
    }
}

#[tauri::command]
fn addcat() -> String {
    if let Err(_err) = add_cat() {
        return format!("error");
    }
    format!("cat added")
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

#[tauri::command]
async fn testjson(url: String) -> Result<serde_json::Value, String> {
    let result = get_post_as_string2(url).await;
    if let Ok(message) = result {
        Ok(message)
    } else {
        Err("No result".into())
    }
}

use tauri::{
    api::process::{Command, CommandEvent},
    Manager,
};
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
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                let (mut rx, mut child) = Command::new_sidecar("node-app")
                    .expect("failed to setup `app` sidecar")
                    .spawn()
                    .expect("Failed to spawn packaged node");

                let mut i = 0;
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        window
                            .emit("message", Some(format!("'{}'", line)))
                            .expect("failed to emit event");
                        i += 1;
                        if i == 4 {
                            child.write("message from Rust\n".as_bytes()).unwrap();
                            i = 0;
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, connect, testjson, addcat, getcats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
