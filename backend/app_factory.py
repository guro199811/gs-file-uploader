from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app():
    app = FastAPI(title="File Upload API")

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Frontend URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        return {"message": "Welcome to File Upload API"}

    @app.post("/upload")
    async def upload_file():
        # TODO: Implement file upload logic
        return {"message": "File upload endpoint"}

    return app
