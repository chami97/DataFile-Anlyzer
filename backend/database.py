import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data_analyst.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            row_count INTEGER,
            col_count INTEGER,
            data_json TEXT,
            summary_json TEXT,
            insights_json TEXT,
            chart_data_json TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_dataset(dataset):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Extract data from the dataset object (matching frontend format)
    # dataset usually has: id, name, date, rowCount, colCount, data, summary, insights, chartData
    cursor.execute("""
        INSERT OR REPLACE INTO datasets (
            id, name, date, row_count, col_count, data_json, summary_json, insights_json, chart_data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dataset.get('id', 'unknown_' + str(dataset.get('name', 'file'))),
        dataset.get('name', 'Unknown Dataset'),
        dataset.get('date', 'Unknown Date'),
        dataset.get('rowCount', 0),
        dataset.get('colCount', 0),
        json.dumps(dataset.get('data', [])),
        json.dumps(dataset.get('summary', {})),
        json.dumps(dataset.get('insights', {})),
        json.dumps(dataset.get('chartData', {}))
    ))
    conn.commit()
    conn.close()

def get_all_datasets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM datasets ORDER BY date DESC")
    rows = cursor.fetchall()
    
    datasets = []
    for row in rows:
        datasets.append({
            "id": row["id"],
            "name": row["name"],
            "date": row["date"],
            "rowCount": row["row_count"],
            "colCount": row["col_count"],
            "data": json.loads(row["data_json"]),
            "summary": json.loads(row["summary_json"]),
            "insights": json.loads(row["insights_json"]),
            "chartData": json.loads(row["chart_data_json"])
        })
    
    conn.close()
    return datasets

def delete_dataset(dataset_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM datasets WHERE id = ?", (dataset_id,))
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
