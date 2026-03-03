"""
Authentication routes: register, login, refresh token, get user info
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models import UserRegister, UserLogin, Token, TokenRefresh, UserResponse
from app.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, get_current_user
from app.database import create_user, get_user_by_username, update_user_login
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if username or email already exists
    existing_user = get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user
    try:
        user_id = create_user(
            username=user_data.username,
            email=user_data.email,
            password_hash=password_hash,
            customer_id=user_data.customer_id,
            account_number=user_data.account_number
        )
    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    # Get created user
    user = get_user_by_username(user_data.username)
    if not user:
        raise HTTPException(status_code=500, detail="User creation failed")
    
    return UserResponse(**user)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login and receive JWT tokens"""
    # Get user
    user = get_user_by_username(credentials.username)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Update last login
    update_user_login(user["id"])
    
    # Create tokens
    token_data = {
        "sub": str(user["id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "customer_id": user["customer_id"],
        "account_number": user["account_number"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh):
    """Refresh access token using refresh token"""
    payload = decode_token(token_data.refresh_token)
    
    # Verify token type
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = int(payload.get("sub"))
    user = get_user_by_username(user_id)
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create new tokens
    token_payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "customer_id": user["customer_id"],
        "account_number": user["account_number"]
    }
    
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    from app.database import get_user_by_id
    user = get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)
