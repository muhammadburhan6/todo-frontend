import os

from google.auth.transport.requests import Request
from google.oauth2 import id_token


def verify_google_credential(credential):
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        raise RuntimeError("GOOGLE_CLIENT_ID is not configured")
    if not isinstance(credential, str) or not credential or len(credential) > 10000:
        raise ValueError("Google credential is missing or invalid")

    try:
        claims = id_token.verify_oauth2_token(credential, Request(), audience=client_id, clock_skew_in_seconds=60)
    except Exception as exc:
        # Log verifier details only; never log the credential itself.
        print(f"[GOOGLE AUTH] Token verification failed ({type(exc).__name__}): {exc}")
        raise ValueError("Google credential is invalid or expired") from exc

    email = claims.get("email")
    subject = claims.get("sub")
    if (not subject or not isinstance(email, str) or not email.strip()
            or claims.get("email_verified") is not True):
        raise ValueError("Google account must have a verified email address")

    return {
        "sub": subject,
        "email": email.strip().lower(),
        "display_name": (claims.get("name") or "").strip() or email.split("@", 1)[0],
        "hosted_domain": claims.get("hd"),
    }
