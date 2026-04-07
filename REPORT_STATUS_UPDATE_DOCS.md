# Report Status Update Feature - Documentation

## Overview
Admins can now easily change the status of reports using a dropdown menu on the report detail page. This feature provides a simple and intuitive way to update report statuses in real-time.

## Features

### 1. Status Dropdown Menu
- Located in the report title card
- Shows current status
- Allows selection of new status
- Available statuses:
  - **Pending** - Initial status for newly submitted reports
  - **In Progress** - Report is being worked on
  - **Resolved** - Issue has been fixed
  - **Rejected** - Report was not valid/needed

### 2. Real-time Updates
- Status updates instantly when selected
- API call is made asynchronously
- UI shows loading state during update
- Success/error messages displayed to user

### 3. Visual Feedback
- Color-coded status badges:
  - Pending: Yellow
  - In Progress: Blue
  - Resolved: Green
  - Rejected: Red
- Feedback messages after status change
- Disabled state during update to prevent duplicate submissions

## File Structure

```
app/
├── admin/
│   └── reports/
│       └── [id]/
│           └── page.tsx                 # Updated with dropdown UI
├── api/
│   └── admin/
│       └── reports/
│           └── [id]/
│               └── update-status/
│                   └── route.ts         # New API endpoint
```

## API Endpoint

### Update Report Status
**Path**: `PATCH /api/admin/reports/[id]/update-status`

#### Request
```json
{
  "status": "in_progress"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Report status updated successfully",
  "data": {
    "id": "report-id",
    "title": "Report Title",
    "status": "in_progress",
    ...
  }
}
```

#### Valid Status Values
- `pending`
- `in_progress`
- `resolved`
- `rejected`

#### Error Handling
- Invalid status values return 400 error
- Missing report ID returns 400 error
- Database errors return 500 error

## Component Integration

### State Management
```typescript
const [updatingStatus, setUpdatingStatus] = useState(false);
const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
```

### Status Change Handler
```typescript
const handleStatusChange = async (newStatus: string) => {
  // Updates report status via API
  // Shows success/error message
  // Auto-clears message after 3 seconds
}
```

## User Flow

1. Admin opens report detail page
2. Sees status dropdown menu in the title card
3. Clicks dropdown to select new status
4. Status is sent to API
5. Success message is displayed
6. Report status is updated in real-time
7. Message auto-clears after 3 seconds

## Styling

The dropdown uses:
- Tailwind CSS for styling
- Color classes from `getStatusColor()` function
- Responsive design (works on mobile, tablet, desktop)
- Hover and focus states for accessibility

## Security Considerations

- API endpoint uses Supabase server client
- Only admin users should have access to this page
- Status values are validated on the backend
- Proper error handling prevents data corruption

## Future Enhancements

Potential improvements:
1. Add status change history/timeline
2. Add comment field when changing status
3. Send notifications to report creator on status change
4. Add role-based permissions for different admins
5. Add bulk status update for multiple reports
