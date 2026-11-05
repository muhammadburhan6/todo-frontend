import os

from flask import Flask, render_template, request, jsonify

from infrastructure.repositories.mongo_task_repository import MongoTaskRepository
from infrastructure.repositories.mongo_user_repository import MongoUserRepository
from infrastructure.repositories.in_memory_task_repository import InMemoryTaskRepository
from infrastructure.repositories.in_memory_user_repository import InMemoryUserRepository

from application.services.task_service import TaskService
from application.services.auth_service import AuthService

from presentation.controllers.task_controller import TaskController
from presentation.controllers.auth_controller import AuthController

from presentation.routes.task_routes import create_task_routes
from presentation.routes.auth_routes import create_auth_routes


app = Flask(__name__)
def create_repositories():
    """Select persistence explicitly; MongoDB is the normal application mode."""
    mode = os.getenv("DATABASE_MODE", "mongo").strip().lower()
    if mode == "memory":
        return (
            InMemoryTaskRepository(),
            InMemoryUserRepository(),
            "In-memory (temporary)",
        )
    if mode != "mongo":
        raise RuntimeError("DATABASE_MODE must be 'mongo' or 'memory'")

    task_repository = MongoTaskRepository()
    user_repository = MongoUserRepository(client=task_repository.client)
    return task_repository, user_repository, "MongoDB"


# Build the MongoDB adapters unless memory mode was explicitly requested.
task_repository, user_repository, database_backend = create_repositories()


# Services
task_service = TaskService(task_repository)
auth_service = AuthService(user_repository)


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
    # If API client requests JSON specifically
    if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
        return api_status()
    # Otherwise render the visual web interface in browser
    return render_template("index.html")


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
