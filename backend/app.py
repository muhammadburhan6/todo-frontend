import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify

# The shared .env file stays in the repository root beside frontend/ and backend/.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env", override=True)

from application.services.task_service import TaskService
from application.services.auth_service import AuthService

from presentation.controllers.task_controller import TaskController
from presentation.controllers.auth_controller import AuthController

from presentation.routes.task_routes import create_task_routes
from presentation.routes.auth_routes import create_auth_routes


app = Flask(__name__)
def create_repositories(mode=None):
    """Create both auth and task repositories for the selected .env provider."""
    mode = (mode if mode is not None else os.getenv("DATABASE_MODE", "mongodb")).strip().lower()

    if mode == "firebase":
        from infrastructure.repositories.firebase.firestore_task_repository import FirestoreTaskRepository, get_firestore_client
        from infrastructure.repositories.firebase.firestore_user_repository import FirestoreUserRepository

        client = get_firestore_client()
        task_repository = FirestoreTaskRepository(client=client)
        user_repository = FirestoreUserRepository(client=client)
        return task_repository, user_repository, "Firebase Firestore"

    if mode in {"postgres", "postgresql"}:
        from infrastructure.repositories.postgresql.postgres_task_repository import PostgresTaskRepository
        from infrastructure.repositories.postgresql.postgres_user_repository import PostgresUserRepository

        task_repository = PostgresTaskRepository()
        user_repository = PostgresUserRepository(connection=task_repository.connection)
        return task_repository, user_repository, "PostgreSQL"

    if mode in {"mongo", "mongodb"}:
        from infrastructure.repositories.mongodb.mongo_task_repository import MongoTaskRepository
        from infrastructure.repositories.mongodb.mongo_user_repository import MongoUserRepository

        task_repository = MongoTaskRepository()
        user_repository = MongoUserRepository(client=task_repository.client)
        return task_repository, user_repository, "MongoDB"

    raise RuntimeError(
        "DATABASE_MODE in the root .env must be one of: mongodb, firebase, or postgres"
    )


# Auth and task repositories always come from the same selected provider.
task_repository, user_repository, database_backend = create_repositories()
print(f"Database provider: {database_backend}")


# Services
task_service = TaskService(task_repository)
auth_service = AuthService(user_repository, database_mode=database_backend)


# Controllers
task_controller = TaskController(task_service)
auth_controller = AuthController(auth_service)


# Routes
task_routes = create_task_routes(task_controller, auth_service)
auth_routes = create_auth_routes(auth_controller, auth_service)

app.register_blueprint(task_routes)
app.register_blueprint(auth_routes)


@app.route("/")
def home():
    return api_status()


@app.route("/api")
def api_status():
    return jsonify({
        "message": "Todo API is running",
        "database": database_backend,
        "endpoints": {
            "auth": {
                "signup": "POST /signup or /auth/signup",
                "login": "POST /login or /auth/login",
                "profile": "GET /me or /auth/me (requires Bearer token in Authorization header)"
            },
            "tasks": {
                "list": "GET /tasks",
                "create": "POST /tasks",
                "get": "GET /tasks/<task_id>",
                "update": "PUT /tasks/<task_id>",
                "patch": "PATCH /tasks/<task_id>",
                "delete": "DELETE /tasks/<task_id>"
            }
        }
    }), 200


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)


