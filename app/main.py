from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
      <head><title>ValentePro Apps</title></head>
      <body style='font-family:sans-serif;text-align:center;margin-top:10vh;'>
        <h1>Benvenuto su apps.valentepro.com!</h1>
        <p>La tua app Python FastAPI è attiva 🚀</p>
      </body>
    </html>
    """
