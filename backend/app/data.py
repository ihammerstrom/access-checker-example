from datetime import datetime, timedelta
from .config import (
    GROUP_VPN_USERS,
    GROUP_DEV_ACCESS,
    GROUP_PROD_ACCESS,
    GROUP_CONFIG_TOOL,
    ENV_PRODUCTION,
    ENV_DEVELOPMENT,
    PROFILE_PROD,
    PROFILE_DEV,
    PRODUCTION_ACCESS_DURATION
)

# Simulated Okta user database with group memberships
USERS = {
    "Alice Mc'Prod": {
        "okta_groups": {
            ENV_DEVELOPMENT: [
                GROUP_VPN_USERS,  # Okta VPN access group
                GROUP_DEV_ACCESS,  # Okta development environment access group
                GROUP_CONFIG_TOOL  # Okta config tool access group
            ],
            ENV_PRODUCTION: [
                GROUP_VPN_USERS,
                GROUP_PROD_ACCESS,  # Okta production environment access group
                GROUP_CONFIG_TOOL
            ]
        },
        "aws_profile": PROFILE_PROD,  # Current AWS Identity Center profile
        "production_access_expiry": None
    },
    "Bob Mc'NoProd": {
        "okta_groups": {
            ENV_DEVELOPMENT: [
                GROUP_VPN_USERS,
                GROUP_DEV_ACCESS,
                GROUP_CONFIG_TOOL
            ],
            ENV_PRODUCTION: [
                GROUP_VPN_USERS,
                GROUP_CONFIG_TOOL
            ]        
        },
        "aws_profile": PROFILE_DEV,  # Current AWS Identity Center profile
        "production_access_expiry": None
    }
}

def get_user_data(username: str, environment: str):
    """Simulate fetching user data from Okta and AWS Identity Center."""
    user = USERS.get(username)
    if not user:
        raise ValueError(f"User {username} not found")
    
    current_profile = user["aws_profile"]
    profile_status = "correct" if current_profile == environment else "incorrect"
    profile_status_message = f"You are currently in the {profile_status} profile ({current_profile}) for {environment} environment"
    
    # Return the groups for the specific environment and other user data
    return {
        "groups": user["okta_groups"][environment],  # Get groups for the specific environment
        "current_profile": current_profile,
        "production_access_expiry": user["production_access_expiry"],
        "profile_status_message": profile_status_message
    }

def update_production_access(username):
    """Grant new AWS SSO session for 12 hours."""
    if username in USERS:
        # Only update if user has prod-access group
        user_data = get_user_data(username, ENV_PRODUCTION)
        if GROUP_PROD_ACCESS in user_data.get("groups", []):
            USERS[username]["production_access_expiry"] = datetime.now() + timedelta(hours=PRODUCTION_ACCESS_DURATION)
            return True
    return False

def check_production_access_valid(username):
    """Check if AWS SSO session is still valid."""
    user = USERS.get(username)
    if not user:
        return False

    expiry = user.get("production_access_expiry")
    if not expiry:
        return False
    return expiry > datetime.now() 