class User:

    def __init__(self, user_id, email, password_hash, created_at=None):
        self.id = user_id
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
