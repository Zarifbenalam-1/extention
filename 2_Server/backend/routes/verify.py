from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import supabase
from datetime import datetime, timezone

router = APIRouter()

class VerifyRequest(BaseModel):
    license_key: str
    device_fingerprint: str
    extension_id: str = "ext_viral_post_finder"
    service_url: str = ""
    browser_info: str = ""

@router.post("/verify")
def verify_license(req: VerifyRequest):
    result = supabase.table("licenses")\
        .select("*")\
        .eq("license_key", req.license_key)\
        .eq("extension_id", req.extension_id)\
        .single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Invalid license key")

    user = result.data

    if not user["enabled"]:
        raise HTTPException(status_code=403, detail="License disabled")

    now = datetime.now(timezone.utc).isoformat()

    supabase.table("licenses").update({
        "last_seen": now,
        "device_fingerprint": req.device_fingerprint
    }).eq("license_key", req.license_key).execute()

    supabase.table("activity_logs").insert({
        "license_key": req.license_key,
        "user_name": user["name"],
        "device_fingerprint": req.device_fingerprint,
        "extension_id": req.extension_id,
        "service_url": req.service_url,
        "browser_info": req.browser_info,
        "timestamp": now
    }).execute()

    return {"status": "authorized", "user": user["name"]}
