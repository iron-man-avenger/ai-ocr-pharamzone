import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting PharmaAI Backend Server on http://{settings.HOST}:{settings.PORT}")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
