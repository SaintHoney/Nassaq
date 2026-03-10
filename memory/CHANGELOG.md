# NASSAQ Changelog

## March 10, 2026 - Session Update

### ✅ Fixed: Schedule Page (SchedulePage.jsx)
**Root Cause:** The `time_slots` collection in MongoDB was missing required fields:
- `name` (Arabic name)
- `name_en` (English name)
- `duration_minutes`
- `is_active`

**Fix Applied:**
1. Updated database records directly to add missing fields
2. Updated `seed_demo_school_complete.py` to include all required fields for future seeding
3. Schedule page now loads correctly with 360 sessions displayed in a weekly grid

### ✅ Fixed: Teachers Page (TeachersPage.jsx) - Tenant Isolation
**Root Cause:** The page was trying to fetch `/api/schools` which School Principals don't have permission to access.

**Fix Applied:**
1. Modified `fetchData()` to only fetch schools for Platform Admins
2. Hidden school dropdown filter for School-Level users
3. Auto-populate `school_id` from user's `tenant_id` when creating new teachers
4. Backend already enforces tenant isolation (lines 2059-2060 in server.py)

### Architecture Notes - Multi-Tenant Isolation
Based on user's detailed specifications:

**Platform Level Users:**
- Platform Admin
- Platform Super Admin
- Can see all schools and tenants

**School Level Users (Tenant-Scoped):**
- School Principal
- Teachers
- Students
- Parents
- Can ONLY see their own school's data
- Should NEVER see a list of other schools

**Enforcement Points:**
1. Backend APIs already filter by `tenant_id` for non-platform-admin users
2. Frontend pages must NOT call platform-level APIs when logged as school-level user
3. All data queries include `school_id` filter based on user's `tenant_id`

---

## Test Results

### APIs Verified Working:
- ✅ `GET /api/time-slots?school_id=demo-school-001` - Returns 7 time slots
- ✅ `GET /api/schedules?school_id=demo-school-001` - Returns 1 schedule
- ✅ `GET /api/schedule-sessions?schedule_id=...` - Returns 360 sessions
- ✅ `GET /api/teachers` - Returns 25 teachers (tenant-scoped)

### Demo Data Status:
- School: `demo-school-001` (مدرسة نَسَّق التجريبية)
- Teachers: 25
- Students: 300
- Classes: 12 (6 grades × 2 sections)
- Time Slots: 7 (6 periods + 1 break)
- Schedule Sessions: 360

### Test Credentials:
- **Principal:** `principal@nassaq.com` / `Principal@123`
