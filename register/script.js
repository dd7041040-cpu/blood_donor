from flask import Flask, request, redirect, url_for, send_file, send_from_directory
from pathlib import Path
import sqlite3

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

def init_db():
    conn = sqlite3.connect(BASE_DIR / "blood_donors.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS donors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            blood_group TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            city TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return redirect("/register")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        age = request.form.get("age")
        blood_group = request.form.get("blood_group")
        phone = request.form.get("phone")
        email = request.form.get("email")
        city = request.form.get("city")

        if not all([name, age, blood_group, phone, email, city]):
            return "Please fill all details", 400

        conn = sqlite3.connect(BASE_DIR / "blood_donors.db")
        conn.execute(
            "INSERT INTO donors (name, age, blood_group, phone, email, city) VALUES (?, ?, ?, ?, ?, ?)",
            (name, age, blood_group, phone, email, city)
        )
        conn.commit()
        conn.close()

        return redirect(url_for("success"))

    return send_file(BASE_DIR / "register" / "register.html")

@app.route("/success")
def success():
    return """
    <html>
    <head>
        <title>Registration Successful</title>
    </head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <h2>Thank you for registering as a blood donor!</h2>
        <p>Your details were saved successfully.</p>
        <a href="/register">Register again</a>
    </body>
    </html>
    """

@app.route("/register/<path:filename>")
def serve_register_files(filename):
    return send_from_directory(BASE_DIR / "register", filename)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
