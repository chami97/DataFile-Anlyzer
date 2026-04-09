from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
import httpx
import base64
import os
import re
import google.generativeai as genai
from typing import Optional
from database import get_all_datasets, save_dataset, delete_dataset

app = FastAPI(title="AI Data Analyst Assistant")

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

@app.get("/")
def read_root():
    return {"status": "online", "message": "AI Data Analyst API is running"}

@app.get("/api/datasets")
async def get_datasets():
    try:
        datasets = get_all_datasets()
        return datasets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/datasets")
async def store_dataset(payload: dict):
    try:
        # Check required fields
        if not payload.get('id'):
            payload['id'] = "manual_" + str(payload.get('name', 'dataset'))
            
        save_dataset(payload)
        return {"status": "success", "message": "Dataset saved successfully"}
    except Exception as e:
        print(f"Error saving dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/api/datasets/{id}")
async def remove_dataset(id: str):
    try:
        delete_dataset(id)
        return {"status": "success", "message": "Dataset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    # Simple data analysis as a demonstration
    contents = await file.read()
    filename = file.filename
    
    if filename.endswith('.csv'):
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    elif filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(io.BytesIO(contents))
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_info": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "preview": df.head(5).to_dict(orient='records')
    }
    
    return summary

@app.post("/fetch-external-file")
async def fetch_external_file(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    # Handle OneDrive Sharing Links
    # Convert "https://1drv.ms/x/s!XXXX" to a direct download link
    if "1drv.ms" in url or "onedrive.live.com" in url:
        # Standard OneDrive "u!" encoding trick for direct download
        try:
            # Strip trailing space and get the base64 part
            encoded_url = base64.b64encode(url.encode('utf-8')).decode('utf-8').replace('/', '_').replace('+', '-').rstrip('=')
            url = f"https://api.onedrive.com/v1.0/shares/u!{encoded_url}/root/content"
        except Exception as e:
            print(f"URL Encoding Error: {e}")

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=30.0)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch file from cloud. Status: {response.status_code}")
            
            # Identify file type and name from headers
            content_type = response.headers.get("content-type", "")
            filename = "cloud_file.xlsx" # Default
            
            # Simple content-disposition parsing
            disp = response.headers.get("content-disposition", "")
            if "filename=" in disp:
                filename = disp.split("filename=")[1].strip('"')
            elif "csv" in content_type:
                filename = "cloud_file.csv"

            # Return file content as base64 to avoid binary streaming issues in some frontend fetch setups
            file_b64 = base64.b64encode(response.content).decode('utf-8')
            
            return {
                "filename": filename,
                "content_type": content_type,
                "data": file_b64
            }
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Could not connect to the external server. Check the URL and your connection.")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to external file timed out.")
    except Exception as e:
        print(f"Fetch unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Fetch Error: {str(e)}")

@app.post("/chat")
async def chat_with_data(payload: dict):
    user_query = payload.get("query", "").lower()
    summary = payload.get("summary", {})
    
    if not summary or not summary.get("columns"):
        return {"response": "I don't have any data to analyze yet. Please upload a file first!"}

    row_count = summary.get("rowCount", 0)
    col_count = summary.get("colCount", 0)
    cols = summary.get("columns", [])
    total_missing = summary.get("totalMissing", 0)
    col_stats = summary.get("columnStats", {})
    primary_category = summary.get("primaryCategory", "Category")

    # --- RULE-BASED ENGINE (Highest Priority for Accuracy) ---
    
    # 1. Mandatory Greetings / General Response
    if re.search(r'\b(hi|hello|hey)\b', user_query):
        return {"response": f"Hello! I've analyzed your {row_count:,} records. I can summarize the file, calculate totals, find trends, or answer specific questions. What would you like to know?"}

    # Helper function for word-boundary matching
    def matches_any(words, query):
        patterns = [rf'\b{re.escape(word)}\b' for word in words]
        return any(re.search(p, query) for p in patterns)

    # 2. Aggregations: SUM / TOTAL / AVERAGE / MAX / MIN
    target_num_col = None
    for col in cols:
        col_clean = col.lower().replace("_"," ")
        if col_stats.get(col, {}).get('isNumeric') and (re.search(rf'\b{re.escape(col.lower())}\b', user_query) or re.search(rf'\b{re.escape(col_clean)}\b', user_query)):
            target_num_col = col
            break
            
    if target_num_col:
        stats = col_stats[target_num_col]
        # TOTAL / SUM
        if matches_any(["total", "sum", "altogether", "add up"], user_query):
            if 'sum' in stats:
                return {"response": f"The total sum for **{target_num_col}** is **{stats['sum']:,}**."}
        
        # AVERAGE
        if matches_any(["average", "avg", "mean"], user_query):
            return {"response": f"The average for **{target_num_col}** is **{stats['avg']:,.2f}**."}
            
        # MAX
        if matches_any(["highest", "max", "maximum", "peak"], user_query):
            label = stats.get('max_linked_label', 'N/A')
            resp = f"The maximum **{target_num_col}** is **{stats['max']:,}**."
            if label != 'N/A': resp += f" This was for **{label}**."
            return {"response": resp}

        # MIN
        if matches_any(["lowest", "min", "minimum", "smallest"], user_query):
            label = stats.get('min_linked_label', 'N/A')
            resp = f"The minimum **{target_num_col}** is **{stats['min']:,}**."
            if label != 'N/A': resp += f" This was for **{label}**."
            return {"response": resp}

    # 3. Quick Overview / Summary
    if matches_any(["summarize", "summary", "overview", "describe", "tell me about"], user_query):
        numeric_cols = [c for c in cols if col_stats.get(c, {}).get('isNumeric')]
        response = f"This dataset contains {row_count:,} records across {col_count} columns. "
        response += f"The main numeric columns are {', '.join(numeric_cols[:3])}. "
        if total_missing > 0:
            response += f"Note: There are {total_missing} missing values in the data. "
        response += "What specific detail should I dive into?"
        return {"response": response}

    # --- NATURAL AI FALLBACK (Gemini Engine) ---
    if model:
        try:
            # Construct a context-rich prompt
            prompt = f"""
            You are a professional Data Analyst Assistant. 
            You are analyzing a dataset with {row_count} rows and {col_count} columns.
            Column names: {', '.join(cols)}
            Summary of statistics (columnStats): {json.dumps(col_stats)}
            The user asked: "{payload.get("query")}"
            
            Based ONLY on the statistics provided, answer the user's question naturally.
            If you provide numbers, use markdown bolding. 
            If the question is conversational, be helpful and professional.
            If the data provided isn't enough to answer precisely, tell them what you CAN see.
            """
            ai_response = model.generate_content(prompt)
            return {"response": ai_response.text}
        except Exception as e:
            print(f"Gemini Error: {e}")
            # Fallback to local logic if AI fails
    
    # Final Fallback
    return {"response": f"I see your data has {row_count} records. Based on my scan, I can help calculate totals for {cols[0]}, summarize trends, or identify outliers. What would you like to know?"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
