from dataclasses import dataclass
from typing import Optional


@dataclass
class AuthRequestDTO:
    email: Optional[str]
    password: Optional[str]

    @classmethod
    def from_dict(cls, data):
        return cls(
            email=data.get("email"),
            password=data.get("password")
        )


@dataclass
class AuthResponseDTO:
    user: dict
    token: str

    def to_dict(self):
        return {
            "user": self.user,
            "token": self.token
        }
