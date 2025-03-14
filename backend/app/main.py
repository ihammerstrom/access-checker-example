from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from .models import AccessStatus, ProfileStatus
from .data import (
    get_user_data,
    check_production_access_valid,
    update_production_access,
    USERS
)

app = FastAPI(title="Security Access Verification System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/users")
async def get_users():
    """Get list of all users"""
    return list(USERS.keys())

@app.get("/access-status/{username}")
async def get_access_status(username: str, environment: str) -> AccessStatus:
    """
    Check user's access status for VPN, production group, and config tool.
    Also verifies if production access is still valid within the 12-hour window.
    """
    if username not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = get_user_data(username, environment)
    user_groups = set(user_data.get("groups"))
    
    # Check each access independently
    vpn_access = "vpn-users" in user_groups
    config_tool_access = "config-tool-users" in user_groups
    
    # Production group access depends on environment
    if environment == "production":
        has_prod_group = "prod-access" in user_groups
        production_valid = check_production_access_valid(username) if has_prod_group else False
        
        # Only show production access as valid if both the group membership exists AND the session is valid
        production_group_access = has_prod_group and production_valid
        
        # Get expiry only if access is currently valid
        expiry = user_data.get("production_access_expiry") if production_valid else None
    elif environment == "development":
        production_group_access = "dev-access" in user_groups
        expiry = None
    else:
        raise HTTPException(status_code=400, detail="Invalid environment")

    return AccessStatus(
        vpn_access=vpn_access,
        production_group_access=production_group_access,
        config_tool_access=config_tool_access,
        production_access_valid_until=expiry
    )

@app.post("/refresh-production-access/{username}")
async def refresh_production_access(username: str):
    """
    Attempt to refresh production access for 12 hours if user has prod-access group.
    """
    if username not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = get_user_data(username, "production")
    user_groups = set(user_data.get("groups", []))
    
    if "prod-access" not in user_groups:
        raise HTTPException(
            status_code=403,
            detail="User does not have production access group membership"
        )
    
    success = update_production_access(username)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to update production access"
        )
    
    return {"message": "Production access refreshed successfully"}

@app.get("/profile-status/{username}")
async def get_profile_status(username, environment) -> ProfileStatus:
    """
    Check if user needs to switch to production profile.
    """
    if username not in USERS:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = get_user_data(username, environment)
    current_profile = user_data.get("current_profile")
    
    # Check if user has valid production access
    prod_access = environment == "production" and check_production_access_valid(username)
    
    # Determine if user needs to switch profiles
    needs_switch = prod_access and current_profile != "prod"
    
    # Map environment to expected profile
    expected_profile = "prod" if environment == "production" else "dev"
    is_correct = current_profile == expected_profile
    
    # Create appropriate message based on profile and environment
    profile_status_message = (
        f"You are currently in the {'correct' if is_correct else 'incorrect'} profile "
        f"({current_profile}) for {environment} environment"
    )
    
    return ProfileStatus(
        needs_switch=needs_switch,
        profile_status_message=profile_status_message,
        current_profile=current_profile
    ) 