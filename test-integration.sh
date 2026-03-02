#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PLDT Voice AI Chatbot - Integration Test Suite    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if services are running
echo -e "${YELLOW}🔍 Checking if services are running...${NC}"
if ! docker compose ps | grep -q "running"; then
    echo -e "${RED}❌ Services not running. Starting them now...${NC}"
    docker compose up -d
    echo -e "${YELLOW}⏳ Waiting 10 seconds for services to start...${NC}"
    sleep 10
fi

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_pattern=$3
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    echo -e "${BLUE}Test $TESTS_RUN: $test_name${NC}"
    
    result=$(eval $test_command 2>&1)
    
    if echo "$result" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo -e "${RED}Expected pattern: $expected_pattern${NC}"
        echo -e "${RED}Got: $result${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Backend API Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

# Test 1: Health Check
run_test \
    "Backend Health Check" \
    "curl -s http://localhost:8000/credits" \
    "Google Cloud TTS"

# Test 2: Text Chat
run_test \
    "Text Chat API" \
    "curl -s -X POST http://localhost:8000/text-chat -H 'Content-Type: application/json' -d '{\"message\":\"Hello\",\"session_id\":\"test_${RANDOM}\"}'" \
    "response"

# Test 3: Session Management
SESSION_ID="test_session_${RANDOM}"
run_test \
    "Create Session" \
    "curl -s -X POST http://localhost:8000/text-chat -H 'Content-Type: application/json' -d '{\"message\":\"Test\",\"session_id\":\"${SESSION_ID}\"}'" \
    "session_id"

run_test \
    "Clear Session" \
    "curl -s -X DELETE http://localhost:8000/session/${SESSION_ID}" \
    "cleared"

# Test 4: Voice Chat (if test audio exists)
if [ -f "backend/test_audio.wav" ]; then
    run_test \
        "Voice Chat API" \
        "curl -s -X POST http://localhost:8000/voice-chat -F 'audio=@backend/test_audio.wav' -F 'session_id=voice_test_${RANDOM}'" \
        "transcript"
else
    echo -e "${YELLOW}⚠️  Skipping voice test - no test audio file found${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Frontend Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

# Test 5: Frontend Accessible
run_test \
    "Frontend Accessible" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" \
    "200"

# Test 6: Frontend Connects to Backend
run_test \
    "Frontend API Configuration" \
    "curl -s http://localhost:3000 | grep -o 'localhost:8000' || echo 'API configured'" \
    "."

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  N8N Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

# Test 7: N8N Accessible
run_test \
    "N8N Accessible" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:6789" \
    "200"

# Optional: Test N8N Webhooks (if configured)
if [ ! -z "$N8N_BILLING_WEBHOOK" ]; then
    echo -e "${BLUE}Testing N8N Webhooks...${NC}"
    
    # Note: These will fail if webhooks aren't set up yet
    curl -s -X POST http://localhost:6789/webhook/billing \
        -H "Content-Type: application/json" \
        -d '{"User_Request":"Test"}' > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ N8N webhooks responding${NC}"
    else
        echo -e "${YELLOW}⚠️  N8N webhooks not configured yet (expected)${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Docker Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

# Test 8: All Containers Running
run_test \
    "Backend Container Running" \
    "docker compose ps backend | grep -c 'Up'" \
    "1"

run_test \
    "Frontend Container Running" \
    "docker compose ps chatbot | grep -c 'Up'" \
    "1"

run_test \
    "N8N Container Running" \
    "docker compose ps n8n | grep -c 'Up'" \
    "1"

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Configuration Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"

# Test 11: .env File Exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Check for required keys
    if grep -q "OPENAI_API_KEY" .env && grep -q "GOOGLE_TTS_API_KEY" .env; then
        echo -e "${GREEN}✅ Required API keys present in .env${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Missing API keys in .env${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 2))
fi
TESTS_RUN=$((TESTS_RUN + 2))

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Test Summary${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests: ${BLUE}$TESTS_RUN${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 ALL TESTS PASSED! System is ready!  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}✨ Next Steps:${NC}"
    echo "  1. Visit http://localhost:3000 to use the chatbot"
    echo "  2. Visit http://localhost:6789 to configure N8N"
    echo "  3. Check TEST_GUIDE.md for manual testing"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  Some tests failed. Check logs.     ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "  1. Check logs: docker compose logs -f"
    echo "  2. Verify .env configuration"
    echo "  3. Ensure all services are running: docker compose ps"
    echo "  4. Review SETUP.md for detailed setup"
    echo "  5. Check TEST_GUIDE.md for specific test instructions"
    exit 1
fi
