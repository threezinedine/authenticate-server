from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
import os

app = FastAPI()

# Point Jinja2 to the frontend pages directory
templates_dir = os.path.join(os.path.dirname(__file__), "frontend", "pages")
templates = Jinja2Templates(directory=templates_dir)

@app.get("/")
def main():
    return {"message": "Hello from server!"}

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login/index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
