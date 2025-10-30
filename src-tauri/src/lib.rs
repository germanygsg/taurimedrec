// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(mobile)]
#[tauri::mobile_entry_point]
pub fn mobile_main() {
    main()
}

use serde::{Deserialize, Serialize};
use rusqlite::{Connection, Result, params};
use std::sync::{Arc, Mutex};
use tauri::State;
use chrono::Datelike;

#[derive(Debug, Serialize, Deserialize)]
pub struct Patient {
    pub id: Option<i32>,
    pub record_number: String,
    pub name: String,
    pub age: i32,
    pub address: Option<String>,
    pub phone_number: String,
    pub initial_diagnosis: Option<String>,
}

pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}

#[tauri::command]
async fn get_patients(state: State<'_, AppState>) -> Result<Vec<Patient>, String> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT id, record_number, name, age, address, phone_number, initial_diagnosis FROM patients ORDER BY id DESC")
        .map_err(|e| e.to_string())?;

    let patients = stmt
        .query_map([], |row| {
            Ok(Patient {
                id: Some(row.get(0)?),
                record_number: row.get(1)?,
                name: row.get(2)?,
                age: row.get(3)?,
                address: row.get(4)?,
                phone_number: row.get(5)?,
                initial_diagnosis: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(patients)
}

#[tauri::command]
async fn add_patient(patient: Patient, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().unwrap();

    db.execute(
        "INSERT INTO patients (record_number, name, age, address, phone_number, initial_diagnosis)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            patient.record_number,
            patient.name,
            patient.age,
            patient.address,
            patient.phone_number,
            patient.initial_diagnosis
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok("Patient added successfully".to_string())
}

#[tauri::command]
async fn update_patient(id: i32, patient: Patient, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().unwrap();

    db.execute(
        "UPDATE patients SET name = ?1, age = ?2, address = ?3, phone_number = ?4, initial_diagnosis = ?5
         WHERE id = ?6",
        params![
            patient.name,
            patient.age,
            patient.address,
            patient.phone_number,
            patient.initial_diagnosis,
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok("Patient updated successfully".to_string())
}

#[tauri::command]
async fn delete_patient(id: i32, state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().unwrap();

    db.execute("DELETE FROM patients WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok("Patient deleted successfully".to_string())
}

#[tauri::command]
async fn generate_record_number(state: State<'_, AppState>) -> Result<String, String> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT COUNT(*) as count FROM patients")
        .map_err(|e| e.to_string())?;

    let count: i64 = stmt.query_row([], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let year = chrono::Utc::now().year();
    let next_number = count + 1;
    let record_number = format!("PT{:06}{:06}", year, next_number);

    Ok(record_number)
}

#[tauri::command]
#[cfg(target_os = "android")]
async fn print_invoice(text: String, job_name: Option<String>) -> Result<String, String> {
    // On Android, we need to call the Kotlin MainActivity.printInvoice function
    // Since Rust can't directly call Kotlin, we'll return a special response
    // that JavaScript will handle by calling the Android interface
    let job_name_str = job_name.unwrap_or_else(|| "Invoice".to_string());
    
    // Return a marker that tells JavaScript to call the Android interface
    Ok(format!("PRINT:{}:{}", job_name_str, text))
}

#[tauri::command]
#[cfg(not(target_os = "android"))]
async fn print_invoice(_text: String, _job_name: Option<String>) -> Result<String, String> {
    Err("Printing only available on Android".to_string())
}

fn init_database() -> Result<Connection> {
    // On Android, try to use the app's data directory
    // On desktop, use the current working directory
    let db_path = if cfg!(target_os = "android") {
        // On Android, use the app's internal storage
        match std::env::var("HOME") {
            Ok(home) => {
                let path = format!("{}/patients.db", home);
                println!("Using Android database path: {}", path);
                path
            }
            Err(_) => {
                println!("HOME not set, using default patients.db");
                "patients.db".to_string()
            }
        }
    } else {
        "patients.db".to_string()
    };

    let conn = Connection::open(&db_path)
        .map_err(|e| {
            eprintln!("Failed to open database at {}: {}", db_path, e);
            e
        })?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            address TEXT,
            phone_number TEXT NOT NULL,
            initial_diagnosis TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )
    .map_err(|e| {
        eprintln!("Failed to create patients table: {}", e);
        e
    })?;

    println!("Database initialized successfully at: {}", db_path);
    Ok(conn)
}

#[tokio::main]
pub async fn main() {
    println!("Starting Patient Management App...");

    let conn = match init_database() {
        Ok(conn) => {
            println!("Database initialized successfully");
            conn
        }
        Err(e) => {
            eprintln!("Fatal: Failed to initialize database: {}", e);
            // Instead of panicking, we'll create an in-memory database as fallback
            eprintln!("Falling back to in-memory database");
            Connection::open(":memory:")
                .expect("Failed to create in-memory database")
        }
    };

    // Ensure the patients table exists even for in-memory database
    if let Err(e) = conn.execute(
        "CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            address TEXT,
            phone_number TEXT NOT NULL,
            initial_diagnosis TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ) {
        eprintln!("Failed to create patients table: {}", e);
    }

    let app_state = AppState {
        db: Arc::new(Mutex::new(conn)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_patients,
            add_patient,
            update_patient,
            delete_patient,
            generate_record_number,
            print_invoice
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}