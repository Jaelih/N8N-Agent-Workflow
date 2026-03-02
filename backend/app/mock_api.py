import datetime

def mock_get_billing(account_number: str) -> dict:
    accounts = {
        "1234567890": {
            "accountNumber": "1234567890",
            "accountName": "Juan dela Cruz",
            "planDescription": "PLDT Fiber 100Mbps",
            "outstandingBalance": 1599.00,
            "paymentDueDate": "2026-03-05",
            "billingStatus": "Unpaid",
            "lastPaymentAmount": 1599.00,
            "lastPaymentDate": "2026-01-30"
        },
        "0987654321": {
            "accountNumber": "0987654321",
            "accountName": "Maria Santos",
            "planDescription": "PLDT Fiber 200Mbps",
            "outstandingBalance": 0,
            "paymentDueDate": "2026-03-10",
            "billingStatus": "Paid",
            "lastPaymentAmount": 2199.00,
            "lastPaymentDate": "2026-02-10"
        }
    }
    if account_number not in accounts:
        return {"error": f"Account {account_number} not found."}
    return accounts[account_number]


def mock_check_outage(area: str) -> dict:
    outages = {
        "Quezon City": {
            "has_outage": True,
            "summary": "There is an ACTIVE outage in Quezon City affecting Batasan Hills and Commonwealth areas.",
            "outages": [{
                "outageId": "OT-20260222-001",
                "affectedAreas": ["Batasan Hills", "Commonwealth"],
                "cause": "Fiber cut due to road construction",
                "estimatedRestoration": "2026-02-23T18:00:00",
                "severity": "Major",
                "serviceType": "Fiber"
            }]
        },
        "Makati": {
            "has_outage": False,
            "summary": "No outage in Makati.",
            "outages": []
        }
    }
    return outages.get(area, {
        "has_outage": False,
        "summary": f"No outage data found for {area}.",
        "outages": []
    })


def mock_submit_ticket(account_number: str, concern: str, contact_number: str) -> dict:
    ticket_id = f"PLDT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    return {
        "ticketId": ticket_id,
        "status": "Submitted",
        "message": f"Ticket filed. A representative will contact {contact_number} within 24-48 hours.",
        "concern": concern
    }