from fastapi import HTTPException

class UserNotFoundException(HTTPException):
    def __init__(self, username: str):
        super().__init__(status_code=404, detail=f"User {username} not found")

class InvalidEnvironmentException(HTTPException):
    def __init__(self, environment: str):
        super().__init__(status_code=400, detail=f"Invalid environment: {environment}")

class ProductionAccessDeniedException(HTTPException):
    def __init__(self, username: str):
        super().__init__(status_code=403, detail=f"User {username} does not have production access group membership")

class AccessUpdateFailedException(HTTPException):
    def __init__(self):
        super().__init__(status_code=500, detail="Failed to update production access") 