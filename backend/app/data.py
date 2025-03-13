from datetime import datetime, timedelta

# Simulated user database with environment-specific access
USERS = {
    "alice": {
        "groups": {
            "development": ["vpn_users", "config_tool_users"],
            "production": ["vpn_users", "prod_access", "config_tool_users"]
        },
        "access_profiles": ["prod_profile", "dev_profile"],
        "production_access_expiry": None
    },
    "bob": {
        "groups": {
            "development": ["vpn_users", "config_tool_users"],
            "production": ["vpn_users", "config_tool_users"]  # No prod_access in production
        },
        "access_profiles": ["dev_profile"],
        "production_access_expiry": None
    }
}

# Access requirements per environment
REQUIRED_GROUPS = {
    "development": {
        "vpn": ["vpn_users"],
        "production": [],  # No production access needed in dev
        "config_tool": ["config_tool_users"]
    },
    "production": {
        "vpn": ["vpn_users"],
        "production": ["prod_access"],
        "config_tool": ["config_tool_users"]
    }
}

# Profile configurations
PROFILES = {
    "dev": {
        "name": "dev_profile",
        "is_production": False
    },
    "prod": {
        "name": "prod_profile",
        "is_production": True
    }
}

def get_user_data(username: str, environment: str = "production"):
    """Simulate fetching user data from a database."""
    user = USERS.get(username, {
        "groups": {
            "development": [],
            "production": []
        },
        "access_profiles": [],
        "production_access_expiry": None
    })
    
    # Return environment-specific groups
    return {
        "groups": user["groups"].get(environment, []),
        "access_profiles": user["access_profiles"],
        "production_access_expiry": user["production_access_expiry"]
    }

def update_production_access(username: str):
    """Grant production access for 12 hours."""
    if username in USERS:
        USERS[username]["production_access_expiry"] = datetime.now() + timedelta(hours=12)
        return True
    return False

def check_production_access_valid(username: str) -> bool:
    """Check if production access is still valid."""
    user = USERS.get(username)
    if not user:
        return False
    expiry = user.get("production_access_expiry")
    if not expiry:
        return False
    return expiry > datetime.now() 