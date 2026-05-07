# Debugging Guide - My Reports Issue

## How to View Console Logs

1. **Open your browser** and go to http://localhost:3000
2. **Open Developer Tools:**
   - **Chrome/Edge**: Press `Ctrl+Shift+J` (Windows) or `Cmd+Option+J` (Mac)
   - **Firefox**: Press `Ctrl+Shift+K` (Windows) or `Cmd+Option+K` (Mac)

3. **Click on the "Console" tab** at the top

## Steps to Reproduce and Debug

1. Go to **My Reports** page
2. Look for these console messages:
   - `=== USER PROFILE INITIALIZATION ===` - shows if user data is being loaded
   - `=== EFFECT: userId changed ===` - shows when userId is set
   - `=== FETCH REPORTS CALLED ===` - shows when reports are being fetched
   - `API Response:` - shows what the API returns
   - `Filtered user reports:` - shows how many reports match your user ID

3. **Click on a report** to view it
4. **Click "Back to My Reports"**
5. Look for:
   - `Page regained focus, refetching reports` - should appear when you come back
   - Check if `=== FETCH REPORTS CALLED ===` appears again
   - Check the `API Response:` and `Filtered user reports:` numbers

## What to Look For

- Is `User ID:` showing the correct ID?
- Is `Total reports from API:` showing a number > 0?
- Is `Filtered user reports:` showing 0 or a number?
- Are the user_id values matching in the filter logs?

## Please Share

Screenshot or copy-paste the **entire console output** and send it back so we can see exactly what's happening!
