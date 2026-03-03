"""
Ticket management routes: CRUD operations for support tickets
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models import (
    TicketCreate, TicketUpdate, TicketResponse, TicketListResponse
)
from app.auth import get_current_user
from app.database import (
    create_ticket, get_tickets, get_ticket_by_id, 
    update_ticket, delete_ticket
)

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=201)
async def create_new_ticket(
    ticket_data: TicketCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new support ticket"""
    # Use account number from user profile if available, otherwise require in request
    account_number = current_user.get("account_number")
    if not account_number:
        raise HTTPException(
            status_code=400, 
            detail="No account number found. Please update your profile."
        )
    
    try:
        ticket_id = create_ticket(
            user_id=current_user["user_id"],
            account_number=account_number,
            title=ticket_data.title,
            description=ticket_data.description,
            category=ticket_data.category.value,
            priority=ticket_data.priority.value,
            contact_number=ticket_data.contact_number
        )
        
        # Return created ticket
        ticket = get_ticket_by_id(ticket_id, current_user["user_id"])
        if not ticket:
            raise HTTPException(status_code=500, detail="Failed to create ticket")
        
        return TicketResponse(**ticket)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket creation failed: {str(e)}")


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get paginated list of user's tickets"""
    tickets, total = get_tickets(current_user["user_id"], page, page_size)
    
    return TicketListResponse(
        tickets=[TicketResponse(**t) for t in tickets],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket_details(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific ticket details"""
    ticket = get_ticket_by_id(ticket_id, current_user["user_id"])
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return TicketResponse(**ticket)


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket_details(
    ticket_id: str,
    ticket_updates: TicketUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update ticket (status, priority, description, etc.)"""
    # Get existing ticket
    existing_ticket = get_ticket_by_id(ticket_id, current_user["user_id"])
    if not existing_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Build updates dict (only include provided fields)
    updates = {}
    if ticket_updates.title is not None:
        updates["title"] = ticket_updates.title
    if ticket_updates.description is not None:
        updates["description"] = ticket_updates.description
    if ticket_updates.category is not None:
        updates["category"] = ticket_updates.category.value
    if ticket_updates.priority is not None:
        updates["priority"] = ticket_updates.priority.value
    if ticket_updates.status is not None:
        updates["status"] = ticket_updates.status.value
    if ticket_updates.contact_number is not None:
        updates["contact_number"] = ticket_updates.contact_number
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update ticket
    success = update_ticket(ticket_id, current_user["user_id"], updates)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update ticket")
    
    # Return updated ticket
    updated_ticket = get_ticket_by_id(ticket_id, current_user["user_id"])
    return TicketResponse(**updated_ticket)


@router.delete("/{ticket_id}", status_code=204)
async def delete_ticket_by_id(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a ticket"""
    success = delete_ticket(ticket_id, current_user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return None  # 204 No Content
