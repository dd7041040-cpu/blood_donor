from flask import Flask, request, redirect, url_for, send_from_directory
from pathlib import Path
import sqlite3

app = Flask(__name__, static_url_path="", static_folder=".")

BASE_DIR = Path(__file__).resolve().parent

def init_db():
    conn = sqlite3.connect(BASE_DIR / "donors.db")
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
    conn.close()

@app.route("/")
def index():
    return send_from_directory(str(BASE_DIR / "home"), "index.html")

@app.route("/about")
def about():
    return send_from_directory(str(BASE_DIR / "about"), "about.html")

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
            return "Please fill all fields", 400

        conn = sqlite3.connect(BASE_DIR / "donors.db")
        conn.execute(
            "INSERT INTO donors (name, age, blood_group, phone, email, city) VALUES (?, ?, ?, ?, ?, ?)",
            (name, age, blood_group, phone, email, city)
        )
        conn.commit()
        conn.close()

        return redirect(url_for("success"))

    return send_from_directory(str(BASE_DIR / "register"), "register.html")

@app.route("/success")
def success():
    return """
    <html>
      <head><title>Registration Successful</title></head>
      <body style="font-family: Arial; padding: 40px; text-align:center;">
        <h2>Thank you for registering as a blood donor!</h2>
        <p>Your information has been saved successfully.</p>
        <a href="/register">Register another donor</a>
      </body>
    </html>
    """

@app.route("/donors")
def donors():
    conn = sqlite3.connect(BASE_DIR / "donors.db")
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM donors ORDER BY id DESC").fetchall()
    conn.close()

    html = "<h2>Registered Donors</h2><table border='1' cellpadding='10'>"
    html += "<tr><th>ID</th><th>Name</th><th>Age</th><th>Blood Group</th><th>Phone</th><th>Email</th><th>City</th></tr>"
    for row in rows:
        html += f"<tr><td>{row['id']}</td><td>{row['name']}</td><td>{row['age']}</td><td>{row['blood_group']}</td><td>{row['phone']}</td><td>{row['email']}</td><td>{row['city']}</td></tr>"
    html += "</table>"
    return html

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
