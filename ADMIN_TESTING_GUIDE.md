# Admin Panel Testing Guide

## Quick Start

### 1. Create Test Data (Citizens & Reports)
```bash
# Register a citizen account
1. Go to /register
2. Create account with any email/password
3. Login with that account
4. Go to /create-report
5. Fill in all fields and submit
6. Repeat 2-3 times for multiple reports
```

### 2. Create Admin Account
```bash
# Option A: Via Database
1. Open Supabase console
2. Go to users table
3. Edit any user
4. Change role from 'citizen' to 'admin'

# Option B: Via Admin Users Page (once logged in as admin)
1. Go to /admin/users
2. Click "Change Role" on a citizen user
3. Select "Admin" and confirm
```

### 3. Access Admin Dashboard
```bash
# Login as admin
1. Go to /login
2. Use admin account credentials
3. Navigate to /admin/dashboard
4. Should see real data from citizen reports
```

## Admin Dashboard Features

### Dashboard View (`/admin/dashboard`)
✅ **What you should see:**
- Total Reports: Shows exact count from database
- Pending Review: Shows new + pending status reports
- In Progress: Shows reports being worked on
- Resolved: Shows completed reports
- Active Citizens: Shows non-admin user count
- Charts with real data

### Manage Issues (`/admin/reports`)
✅ **What you should see:**
- Table with all citizen reports
- Report titles, locations, categories
- Status badges (color-coded: new=blue, pending=yellow, etc.)
- View buttons for each report
- Live updates as citizens submit new reports

### User Management (`/admin/users`)
✅ **What you should see:**
- All users in the system
- User names, emails, roles
- "Change Role" button for each user
- Ability to toggle between Admin and Citizen roles
- Changes immediately reflected in database

### Settings (`/admin/settings`)
✅ **What you should see:**
- Platform configuration options
- Notification preferences
- Report categories management
- Ability to add/remove categories

## Testing Scenarios

### Scenario 1: Real-Time Report Updates
1. Open two browser windows
   - Window 1: Logged in as admin at /admin/dashboard
   - Window 2: Logged in as citizen at /create-report
2. Citizen submits a report in Window 2
3. Admin refreshes dashboard in Window 1
4. ✅ New report should appear in statistics

### Scenario 2: User Role Management
1. Login as admin
2. Go to /admin/users
3. Find a citizen user
4. Click "Change Role"
5. Select "Admin"
6. ✅ Role should change immediately

### Scenario 3: Access Control
1. Login as citizen
2. Try to access /admin/dashboard
3. ✅ Should redirect to /dashboard (not /admin)

### Scenario 4: Authentication Check
1. Logout (clear localStorage)
2. Try to access /admin/dashboard
3. ✅ Should redirect to /login

## Database Queries (For Verification)

### Check Reports Count
```sql
SELECT COUNT(*) FROM reports;
-- Should match "Total Reports" on dashboard
```

### Check Report Status Distribution
```sql
SELECT status, COUNT(*) as count FROM reports GROUP BY status;
-- Should match dashboard statistics
```

### Check User Count
```sql
SELECT COUNT(*) as total, COUNT(CASE WHEN role='admin' THEN 1 END) as admins
FROM users;
-- Active Citizens = total - admins
```

### Check User Roles
```sql
SELECT id, email, role FROM users ORDER BY created_at DESC;
-- Verify roles can be changed via admin panel
```

## Common Issues & Solutions

### Issue: No data appears on dashboard
**Solution:**
1. Check network tab - /api/admin/stats should return 200
2. Verify Supabase connection in .env.local
3. Ensure SUPABASE_SERVICE_ROLE_KEY is set
4. Check Supabase console for any RLS policy errors

### Issue: Can't change user roles
**Solution:**
1. Verify you're logged in as admin
2. Check browser console for error messages
3. Verify /api/users/[id] endpoint returns 200
4. Confirm SUPABASE_SERVICE_ROLE_KEY has write permissions

### Issue: Redirected to dashboard from /admin
**Solution:**
1. Logout and login again (refresh user data)
2. Check localStorage.getItem('user') in console
3. Verify user.role === 'admin'
4. If not admin, change role via Supabase console

### Issue: Citizen data not showing up
**Solution:**
1. Verify citizen submitted report (check /api/reports endpoint)
2. Refresh admin dashboard
3. Check browser dev tools Network tab for API calls
4. Verify reports table in Supabase has data

## Performance Notes

- Dashboard loads in ~2-5 seconds (first time)
- Subsequent refreshes cached by browser
- Real-time data updates on refresh
- No live updates (page refresh required)

## Browser DevTools Debugging

### Check API Responses
```javascript
// In browser console
// Check what data API returns
fetch('/api/admin/stats').then(r => r.json()).then(console.log)
fetch('/api/reports').then(r => r.json()).then(console.log)
fetch('/api/users').then(r => r.json()).then(console.log)
```

### Check User Role
```javascript
// In browser console
JSON.parse(localStorage.getItem('user')).role
// Should output: 'admin'
```

### Check All Reports
```javascript
// In browser console
fetch('/api/reports').then(r => r.json()).then(d => {
  console.log('Total reports:', d.data.length);
  d.data.forEach(r => console.log(r.title, r.status));
})
```

## Monitoring Checklist

- [ ] Real report data appears on dashboard
- [ ] Report count updates as citizens submit
- [ ] User role changes reflected immediately
- [ ] Non-admin cannot access /admin routes
- [ ] All profile dropdowns work
- [ ] Logout works from all pages
- [ ] Charts display real data
- [ ] Status badges color-coded correctly
- [ ] Date formatting correct
- [ ] API endpoints return 200 status

---

**Last Updated:** April 7, 2026
**Status:** Admin Panel Fully Functional
