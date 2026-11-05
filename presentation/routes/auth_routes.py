from flask import Blueprint, render_template
from presentation.middlewares.auth_middleware import token_required


def create_auth_routes(auth_controller, auth_service=None):

    auth_routes = Blueprint(
        "auth_routes",
        __name__
    )

    service = auth_service or auth_controller.auth_service
    protect = token_required(service)

    # HTML Form pages (for opening directly in Web Browser)
    def render_login_page():
        return render_template("index.html")

    auth_routes.add_url_rule(
        "/login",
        view_func=render_login_page,
        methods=["GET"],
        endpoint="login_page"
    )
    auth_routes.add_url_rule(
        "/signup",
        view_func=render_login_page,
        methods=["GET"],
        endpoint="signup_page"
    )
    auth_routes.add_url_rule(
        "/auth/login",
        view_func=render_login_page,
        methods=["GET"],
        endpoint="auth_login_page"
    )
    auth_routes.add_url_rule(
        "/auth/signup",
        view_func=render_login_page,
        methods=["GET"],
        endpoint="auth_signup_page"
    )

    # SIGNUP / REGISTER API (POST)
    auth_routes.add_url_rule(
        "/signup",
        view_func=auth_controller.register,
        methods=["POST"],
        endpoint="signup"
    )
    auth_routes.add_url_rule(
        "/register",
        view_func=auth_controller.register,
        methods=["POST"],
        endpoint="register"
    )
    auth_routes.add_url_rule(
        "/auth/signup",
        view_func=auth_controller.register,
        methods=["POST"],
        endpoint="auth_signup"
    )
    auth_routes.add_url_rule(
        "/auth/register",
        view_func=auth_controller.register,
        methods=["POST"],
        endpoint="auth_register"
    )

    # LOGIN API (POST)
    auth_routes.add_url_rule(
        "/login",
        view_func=auth_controller.login,
        methods=["POST"],
        endpoint="login"
    )
    auth_routes.add_url_rule(
        "/auth/login",
        view_func=auth_controller.login,
        methods=["POST"],
        endpoint="auth_login"
    )

    # PROTECTED USER PROFILE (GET)
    auth_routes.add_url_rule(
        "/me",
        view_func=protect(auth_controller.get_profile),
        methods=["GET"],
        endpoint="me"
    )
    auth_routes.add_url_rule(
        "/profile",
        view_func=protect(auth_controller.get_profile),
        methods=["GET"],
        endpoint="profile"
    )
    auth_routes.add_url_rule(
        "/auth/me",
        view_func=protect(auth_controller.get_profile),
        methods=["GET"],
        endpoint="auth_me"
    )
    auth_routes.add_url_rule(
        "/auth/profile",
        view_func=protect(auth_controller.get_profile),
        methods=["GET"],
        endpoint="auth_profile"
    )

    return auth_routes
