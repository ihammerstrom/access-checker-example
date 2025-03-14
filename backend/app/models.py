from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    username: str
    groups: List[str] = []
    production_access_expiry: Optional[datetime] = None

class AccessStatus(BaseModel):
    vpn_access: bool = False
    production_group_access: bool = False
    config_tool_access: bool = False
    production_access_valid_until: Optional[datetime] = None

class ProfileStatus(BaseModel):
    needs_switch: bool
    profile_status_message: str
    current_profile: str 