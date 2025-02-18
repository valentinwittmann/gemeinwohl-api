import pandas as pd
import numpy as np
import sqlite3
from fastapi import FastAPI
import uvicorn

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect("gemeinwohl_berater.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS evaluations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        question TEXT,
                        scores TEXT)''')
    conn.commit()
    conn.close()

init_db()

app = FastAPI()

def evaluate_decision(question: str):
    """Evaluates a decision along the four public value dimensions and stores it in SQLite."""
    np.random.seed(42)
    scores = np.random.randint(1, 7, size=12)
    
    data = {
        "Dimension": [
            "Hedonistisch-ästhetisch", "Hedonistisch-ästhetisch", "Hedonistisch-ästhetisch",
            "Moral-ethisch", "Moral-ethisch", "Moral-ethisch",
            "Utilitaristisch-instrumentell", "Utilitaristisch-instrumentell", "Utilitaristisch-instrumentell",
            "Politisch-sozial", "Politisch-sozial", "Politisch-sozial"
        ],
        "Item": [
            "Trägt zur Lebensqualität bei.", "Ist angenehm für die Menschen.", "Macht Freude.",
            "Verhält sich anständig.", "Handelt ethisch einwandfrei.", "Ist fair.",
            "Leistet gute Arbeit im Kerngeschäft.", "Ist professionell anerkannt.", "Ist wirtschaftlich stabil.",
            "Trägt zum sozialen Zusammenhalt bei.", "Schafft eine Gemeinschaft.", "Hat eine positive Wirkung auf soziale Beziehungen."
        ],
        "Score": scores
    }
    df = pd.DataFrame(data)
    avg_scores = df.groupby("Dimension")["Score"].mean().round(2)
    
    conn = sqlite3.connect("gemeinwohl_berater.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO evaluations (question, scores) VALUES (?, ?)", (question, str(avg_scores.to_dict())))
    conn.commit()
    conn.close()
    
    return df, avg_scores

@app.get("/evaluate/")
def evaluate(question: str):
    df, avg_scores = evaluate_decision(question)
    return {"scores": avg_scores.to_dict(), "table": df.to_dict(orient='records')}

@app.get("/history/")
def history():
    """Returns all stored evaluations from the database."""
    conn = sqlite3.connect("gemeinwohl_berater.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluations")
    records = cursor.fetchall()
    conn.close()
    
    return [{"id": row[0], "question": row[1], "scores": row[2]} for row in records]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=10000)
    