from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from backend.database import supabase
from typing import Optional
import secrets, os

router = APIRouter()

def require_admin(token: str):
    if token != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/admin/users")
def get_users(x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    return supabase.table("licenses").select("*").order("created_at", desc=True).execute().data

class CreateUser(BaseModel):
    name: str
    email: Optional[str] = ""
    extension_id: str = "ext_viral_post_finder"
    notes: Optional[str] = ""

@router.post("/admin/users")
def create_user(body: CreateUser, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    key = "LK-" + secrets.token_hex(12).upper()
    result = supabase.table("licenses").insert({
        "name": body.name,
        "email": body.email,
        "license_key": key,
        "extension_id": body.extension_id,
        "notes": body.notes,
        "enabled": True
    }).execute()
    return result.data[0]

@router.patch("/admin/users/{user_id}/toggle")
def toggle_user(user_id: str, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    current = supabase.table("licenses").select("enabled").eq("id", user_id).single().execute()
    new_status = not current.data["enabled"]
    supabase.table("licenses").update({"enabled": new_status}).eq("id", user_id).execute()
    return {"enabled": new_status}

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: str, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    supabase.table("licenses").delete().eq("id", user_id).execute()
    return {"deleted": True}

@router.get("/admin/logs")
def get_logs(limit: int = 100, license_key: Optional[str] = None,
             extension_id: Optional[str] = None, x_admin_token: str = Header(...)):
    require_admin(x_admin_token)
    q = supabase.table("activity_logs").select("*").order("timestamp", desc=True).limit(limit)
    if license_key:  q = q.eq("license_key", license_key)
    if extension_id: q = q.eq("extension_id", extension_id)
    return q.execute().data
