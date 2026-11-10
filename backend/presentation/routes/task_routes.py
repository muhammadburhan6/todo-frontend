from flask import Blueprint
from presentation.middlewares.auth_middleware import token_required


def create_task_routes(task_controller, auth_service=None):

    task_routes = Blueprint(
        "task_routes",
        __name__
    )

    if auth_service:
        protect = token_required(auth_service)
    else:
        def protect(fn):
            return fn

    # CREATE (Requires Login)
    task_routes.route(
        "/tasks",
        methods=["POST"]
    )(protect(task_controller.create_task))

    # READ ALL (Requires Login)
    task_routes.route(
        "/tasks",
        methods=["GET"]
    )(protect(task_controller.get_tasks))

    # READ ONE (Requires Login)
    task_routes.route(
        "/tasks/<task_id>",
        methods=["GET"]
    )(protect(task_controller.get_task))

    # FULL UPDATE (Requires Login)
    task_routes.route(
        "/tasks/<task_id>",
        methods=["PUT"]
    )(protect(task_controller.update_task))

    # PARTIAL UPDATE (Requires Login)
    task_routes.route(
        "/tasks/<task_id>",
        methods=["PATCH"]
    )(protect(task_controller.patch_task))

    # DELETE (Requires Login)
    task_routes.route(
        "/tasks/<task_id>",
        methods=["DELETE"]
    )(protect(task_controller.delete_task))

    return task_routes
