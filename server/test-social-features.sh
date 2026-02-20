#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Base URL for the API
BASE_URL="${API_BASE_URL:-http://localhost:5000}"

# Auth token and IDs set during tests
AUTH_TOKEN=""
USER_ID=""
POST_ID=""
COMMENT_ID=""
OTHER_USER_ID=""
OTHER_TOKEN=""

# ─── Helper Functions ────────────────────────────────────────────────────────

test_endpoint() {
  local description="$1"
  local expected_status="$2"
  local actual_status="$3"
  local body="$4"

  if [ "$actual_status" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $description (HTTP $actual_status)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $description (expected HTTP $expected_status, got HTTP $actual_status)"
    if [ -n "$body" ]; then
      echo "  Response: $body"
    fi
    FAILED=$((FAILED + 1))
  fi
}

check_field() {
  local description="$1"
  local value="$2"
  local expected="$3"

  if [ "$value" = "$expected" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $description (expected '$expected', got '$value')"
    FAILED=$((FAILED + 1))
  fi
}

cleanup_db() {
  echo -e "\n${YELLOW}Cleaning up database...${NC}"
  curl -s -X DELETE "$BASE_URL/test/cleanup" > /dev/null 2>&1 || true
}

seed_db() {
  echo -e "\n${YELLOW}Seeding database...${NC}"
  cd "$(dirname "$0")" && npm run seed > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database seeded successfully${NC}"
  else
    echo -e "${RED}Database seeding failed${NC}"
  fi
}

register_user() {
  local username="$1"
  local email="$2"
  local password="$3"

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\"}")

  local body
  body=$(echo "$response" | head -n -1)
  local status
  status=$(echo "$response" | tail -n 1)

  echo "$body|$status"
}

login_user() {
  local email="$1"
  local password="$2"

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  local body
  body=$(echo "$response" | head -n -1)
  local status
  status=$(echo "$response" | tail -n 1)

  echo "$body|$status"
}

create_post() {
  local token="$1"
  local caption="$2"

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/posts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "{\"caption\":\"$caption\",\"image\":\"https://example.com/test.jpg\"}")

  local body
  body=$(echo "$response" | head -n -1)
  local status
  status=$(echo "$response" | tail -n 1)

  echo "$body|$status"
}

# ─── Setup: register/login two users ────────────────────────────────────────

setup_users() {
  local result1
  result1=$(register_user "socialtest1" "socialtest1@example.com" "Password123!")
  local body1
  body1=$(echo "$result1" | cut -d'|' -f1)
  local status1
  status1=$(echo "$result1" | cut -d'|' -f2)

  if [ "$status1" -ne 201 ] && [ "$status1" -ne 200 ]; then
    # Try login if already exists
    result1=$(login_user "socialtest1@example.com" "Password123!")
    body1=$(echo "$result1" | cut -d'|' -f1)
  fi

  AUTH_TOKEN=$(echo "$body1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  USER_ID=$(echo "$body1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  local result2
  result2=$(register_user "socialtest2" "socialtest2@example.com" "Password123!")
  local body2
  body2=$(echo "$result2" | cut -d'|' -f1)
  local status2
  status2=$(echo "$result2" | cut -d'|' -f2)

  if [ "$status2" -ne 201 ] && [ "$status2" -ne 200 ]; then
    result2=$(login_user "socialtest2@example.com" "Password123!")
    body2=$(echo "$result2" | cut -d'|' -f1)
  fi

  OTHER_TOKEN=$(echo "$body2" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  OTHER_USER_ID=$(echo "$body2" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
}

# ─── Test Suite 1: Empty Database ───────────────────────────────────────────

run_empty_db_tests() {
  echo -e "\n${YELLOW}--- Empty Database Tests ---${NC}\n"

  # Register/Login users
  setup_users

  # GET feed with no posts
  local response
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts/feed" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  local status
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /posts/feed returns 200 with empty database" 200 "$status"

  # GET all posts with no posts
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /posts returns 200 with empty database" 200 "$status"

  # Create a post
  local post_result
  post_result=$(create_post "$AUTH_TOKEN" "Test recipe post")
  local post_body
  post_body=$(echo "$post_result" | cut -d'|' -f1)
  local post_status
  post_status=$(echo "$post_result" | cut -d'|' -f2)
  test_endpoint "POST /posts creates post successfully" 201 "$post_status"

  POST_ID=$(echo "$post_body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$POST_ID" ]; then
    echo -e "${RED}Could not extract post ID, skipping social tests${NC}"
    return
  fi

  # ── Like Tests (empty state) ──────────────────────────────────────────────

  echo -e "\n${YELLOW}  Like System (empty state)${NC}"

  # Check like status (should be false)
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/likes/$POST_ID/check" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  local body
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /likes/:postId/check returns 200 (not liked)" 200 "$status"
  local is_liked
  is_liked=$(echo "$body" | grep -o '"isLiked":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  check_field "isLiked is false for new post" "$is_liked" "false"

  # Toggle like (should like the post)
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/likes/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  test_endpoint "POST /likes/:postId toggles like (like)" 200 "$status"

  # Get all likes (should have 1)
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/likes/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /likes/:postId returns likes array" 200 "$status"

  # Toggle like again (should unlike)
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/likes/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "POST /likes/:postId toggles like (unlike)" 200 "$status"

  # ── Comment Tests (empty state) ───────────────────────────────────────────

  echo -e "\n${YELLOW}  Comment System (empty state)${NC}"

  # Get comments (should be empty)
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/comments/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /comments/:postId returns 200 (empty)" 200 "$status"

  # Add a comment
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/comments/$POST_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"text":"This looks delicious!"}')
  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  test_endpoint "POST /comments/:postId adds comment" 201 "$status"

  COMMENT_ID=$(echo "$body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  # Delete the comment
  if [ -n "$COMMENT_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/comments/$COMMENT_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    status=$(echo "$response" | tail -n 1)
    test_endpoint "DELETE /comments/:commentId deletes comment" 200 "$status"
  fi

  # ── Follow Tests (empty state) ────────────────────────────────────────────

  echo -e "\n${YELLOW}  Follow System (empty state)${NC}"

  if [ -n "$OTHER_USER_ID" ]; then
    # Follow other user
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/follow/$OTHER_USER_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    status=$(echo "$response" | tail -n 1)
    test_endpoint "POST /follow/:userId follows user" 200 "$status"

    # Unfollow other user
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/follow/$OTHER_USER_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    status=$(echo "$response" | tail -n 1)
    test_endpoint "DELETE /follow/:userId unfollows user" 200 "$status"
  fi
}

# ─── Test Suite 2: Seeded Database ──────────────────────────────────────────

run_seeded_db_tests() {
  echo -e "\n${YELLOW}--- Seeded Database Tests ---${NC}\n"

  # Login as the first seeded user (seed.js creates known users)
  local login_result
  login_result=$(login_user "alice@example.com" "password123")
  local login_body
  login_body=$(echo "$login_result" | cut -d'|' -f1)
  local login_status
  login_status=$(echo "$login_result" | cut -d'|' -f2)

  if [ "$login_status" -ne 200 ]; then
    echo -e "${YELLOW}Seeded user login failed (HTTP $login_status) – skipping seeded tests${NC}"
    return
  fi

  AUTH_TOKEN=$(echo "$login_body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

  # GET all posts (seeded)
  local response
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  local body
  body=$(echo "$response" | head -n -1)
  local status
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /posts returns seeded posts" 200 "$status"

  # Verify posts array is present
  local has_posts
  has_posts=$(echo "$body" | grep -c '"posts"')
  if [ "$has_posts" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: Response contains posts field"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: Response missing posts field"
    FAILED=$((FAILED + 1))
  fi

  # GET feed (seeded – shows posts from followed users)
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts/feed" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /posts/feed returns 200 with seeded data" 200 "$status"

  # Get a post ID from the seeded data
  local posts_response
  posts_response=$(curl -s "$BASE_URL/posts" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  POST_ID=$(echo "$posts_response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$POST_ID" ]; then
    echo -e "${YELLOW}No post ID found, skipping post-specific seeded tests${NC}"
    return
  fi

  # ── Like Tests (seeded state) ─────────────────────────────────────────────

  echo -e "\n${YELLOW}  Like System (seeded state)${NC}"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/likes/$POST_ID/check" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /likes/:postId/check works with seeded data" 200 "$status"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/likes/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /likes/:postId returns likes for seeded post" 200 "$status"

  # ── Comment Tests (seeded state) ──────────────────────────────────────────

  echo -e "\n${YELLOW}  Comment System (seeded state)${NC}"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/comments/$POST_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")
  status=$(echo "$response" | tail -n 1)
  test_endpoint "GET /comments/:postId returns comments for seeded post" 200 "$status"

  # Add and then delete a comment to verify counts
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/comments/$POST_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"text":"Seeded test comment"}')
  local comment_body
  comment_body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n 1)
  test_endpoint "POST /comments/:postId adds comment to seeded post" 201 "$status"

  COMMENT_ID=$(echo "$comment_body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$COMMENT_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/comments/$COMMENT_ID" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    status=$(echo "$response" | tail -n 1)
    test_endpoint "DELETE /comments/:commentId removes comment from seeded post" 200 "$status"
  fi
}

# ─── Print Summary ───────────────────────────────────────────────────────────

print_summary() {
  local total=$((PASSED + FAILED))
  echo ""
  echo "════════════════════════════════════════"
  echo " Test Summary"
  echo "════════════════════════════════════════"
  echo -e " Total:  $total"
  echo -e " ${GREEN}Passed:  $PASSED${NC}"
  echo -e " ${RED}Failed:  $FAILED${NC}"
  echo "════════════════════════════════════════"

  if [ "$FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
  else
    echo -e "\n${RED}Some tests failed.${NC}"
    exit 1
  fi
}

# ─── Main ────────────────────────────────────────────────────────────────────

echo "════════════════════════════════════════"
echo " RecipeGram Social Features Test Suite"
echo "════════════════════════════════════════"
echo "Base URL: $BASE_URL"

echo -e "\n=== TESTING WITH EMPTY DATABASE ==="
cleanup_db
run_empty_db_tests

echo -e "\n=== TESTING WITH SEEDED DATABASE ==="
seed_db
run_seeded_db_tests

print_summary
