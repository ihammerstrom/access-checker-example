from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from .models import AccessStatus, ProfileStatus
from .data import (
    get_user_data,
    REQUIRED_GROUPS,
    PROFILES,
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

@app.get("/access-status/{username}")
async def get_access_status(username: str, environment: str = "production") -> AccessStatus:
    """
    Check user's access status for VPN, production group, and config tool.
    Also verifies if production access is still valid within the 12-hour window.
    """
    # First check if user exists
    if username not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = get_user_data(username, environment)
    user_groups = set(user_data.get("groups", []))
    env_requirements = REQUIRED_GROUPS[environment]
    
    # Check each access requirement
    vpn_access = any(group in user_groups for group in env_requirements["vpn"])
    prod_access = any(group in user_groups for group in env_requirements["production"])
    config_tool_access = any(group in user_groups for group in env_requirements["config_tool"])
    
    # Check production access expiry only in production environment
    production_valid = True
    expiry = None
    if environment == "production" and prod_access:
        production_valid = check_production_access_valid(username)
        expiry = user_data.get("production_access_expiry")
        
        if not production_valid:
            # Grant new production access if user has the right group but no valid session
            if update_production_access(username):
                expiry = get_user_data(username, environment).get("production_access_expiry")
    
    return AccessStatus(
        vpn_access=vpn_access,
        production_group_access=prod_access and (production_valid if environment == "production" else True),
        config_tool_access=config_tool_access,
        production_access_valid_until=expiry if environment == "production" else None
    )

@app.get("/profile-status/{username}")
async def get_profile_status(username: str, environment: str = "production") -> ProfileStatus:
    """
    Check user's current tool profile and determine if they need to switch.
    """
    # First check if user exists
    if username not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = get_user_data(username, environment)
    
    # Simulate current profile (in real app, this would be fetched from AWS CLI config)
    current_profile = "dev" if environment == "development" else "prod"
    
    # Check if user has production access and it's valid
    prod_access = environment == "production" and check_production_access_valid(username)
    is_production = PROFILES[current_profile]["is_production"]
    
    # Determine if user needs to switch profiles
    needs_switch = environment == "production" and not is_production
    
    return ProfileStatus(
        current_profile=current_profile,
        is_production=is_production,
        needs_switch=needs_switch
    ) 