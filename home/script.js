from flask import Flask, send_file, send_from_directory
from pathlib import Path

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

@app.route("/")
def index():
    return send_file(BASE_DIR / "home" / "index.html")

@app.route("/home/<path:filename>")
def serve_home_files(filename):
    return send_from_directory(BASE_DIR / "home", filename)

if __name__ == "__main__":
    app.run(debug=True)
