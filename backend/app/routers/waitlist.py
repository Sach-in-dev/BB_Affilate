from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.waitlist import WaitlistEntry
from app.models.user import User
from app.schemas.waitlist import WaitlistSubmit, WaitlistResponse

router = APIRouter(tags=["waitlist"])


@router.post("/public/waitlist", response_model=dict)
async def submit_waitlist(payload: WaitlistSubmit, db: AsyncSession = Depends(get_db)):
    entry = WaitlistEntry(
        name=payload.name,
        email=payload.email,
        instagram_link=payload.instagram_link,
        platforms=payload.platforms,
        social_links=payload.social_links,
        additional_info=payload.additional_info,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"data": {"id": entry.id, "message": "Application submitted successfully"}}


@router.get("/admin/waitlist", response_model=dict)
async def list_waitlist(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = select(WaitlistEntry)
    count_query = select(func.count(WaitlistEntry.id))

    if search:
        like = f"%{search}%"
        filter_cond = (
            WaitlistEntry.name.ilike(like)
            | WaitlistEntry.email.ilike(like)
            | WaitlistEntry.instagram_link.ilike(like)
        )
        query = query.where(filter_cond)
        count_query = count_query.where(filter_cond)

    total = await db.scalar(count_query) or 0
    total_pages = max(1, (total + page_size - 1) // page_size)

    rows = await db.scalars(
        query.order_by(desc(WaitlistEntry.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    entries = [
        WaitlistResponse(
            id=e.id,
            name=e.name,
            email=e.email,
            instagram_link=e.instagram_link,
            platforms=e.platforms,
            social_links=e.social_links,
            additional_info=e.additional_info,
            created_at=e.created_at.isoformat() if e.created_at else None,
        )
        for e in rows.all()
    ]

    return {
        "data": {
            "entries": [e.model_dump() for e in entries],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
    }


@router.delete("/admin/waitlist/{entry_id}", response_model=dict)
async def delete_waitlist_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    entry = await db.get(WaitlistEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    await db.delete(entry)
    await db.commit()
    return {"data": {"message": "Entry deleted"}}
