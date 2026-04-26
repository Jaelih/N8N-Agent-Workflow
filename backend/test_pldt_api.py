from app.pldt_api import check_balance, create_ticket

# Test balance check
print("Testing balance check...")
result = check_balance("0459701501")
print(result)