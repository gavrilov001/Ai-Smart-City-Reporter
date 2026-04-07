# Admin Reports List - Status Dropdown Feature

## Overview
Admins can now change report statuses directly from the Issue Management list page (`/admin/reports`) without navigating to individual report detail pages.

## Features Implemented

### 1. Status Dropdown in Table
- **Location**: Status column in the reports table
- **Functionality**: Click dropdown to select new status
- **Real-time Updates**: Status changes immediately without page reload
- **Visual Feedback**: Success/error messages appear below the dropdown

### 2. Available Status Options
- **Pending** (Yellow) - New or awaiting review
- **In Progress** (Blue) - Currently being worked on
- **Resolved** (Green) - Issue has been fixed
- **Rejected** (Red) - Not valid or required

### 3. User Experience Features
✅ Disabled state during update (prevents duplicate submissions)
✅ Loading indicator (opacity change)
✅ Success message confirmation
✅ Error handling with user feedback
✅ Auto-clearing messages (2-3 seconds)
✅ Color-coded status badges
✅ Smooth transitions and hover effects

## Code Changes

### File: `/app/admin/reports/page.tsx`

#### New State Variables
```typescript
const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
const [statusMessages, setStatusMessages] = useState<{ [key: string]: { type: 'success' | 'error'; text: string } }>({});
```

#### New Handler Function
```typescript
const handleStatusChange = async (reportId: string, newStatus: string) => {
  // Makes PATCH request to API
  // Updates local state
  // Shows success/error message
  // Auto-clears message after 2-3 seconds
}
```

#### Updated JSX in Table
- Replaced static status badge with dropdown select
- Added success/error message display below dropdown
- Integrated with `handleStatusChange` function
- Applied conditional styling for disabled state

### API Endpoint Used
- **Route**: `PATCH /api/admin/reports/[id]/update-status`
- **Already Implemented**: Yes (created in previous feature)
- **Response**: Returns updated report object

## Comparison: Before vs After

### Before (Static Badge)
```tsx
<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
  {report.status}
</span>
```

### After (Interactive Dropdown)
```tsx
<div className="flex flex-col gap-2">
  <select
    value={report.status}
    onChange={(e) => handleStatusChange(report.id, e.target.value)}
    disabled={updatingStatusId === report.id}
    className={`px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer transition-all ${
      updatingStatusId === report.id ? 'opacity-50 cursor-not-allowed' : ''
    } ${getStatusColor(report.status)} border-current focus:outline-none`}
  >
    <option value="pending">Pending</option>
    <option value="in_progress">In Progress</option>
    <option value="resolved">Resolved</option>
    <option value="rejected">Rejected</option>
  </select>
  {statusMessages[report.id] && (
    <div className={`text-xs font-medium px-2 py-0.5 rounded text-center ${...}`}>
      {statusMessages[report.id].text}
    </div>
  )}
</div>
```

## User Flow

1. Admin opens Issue Management page (`/admin/reports`)
2. Views list of all reports in table format
3. Sees status in Status column (now a dropdown)
4. Clicks dropdown to expand options
5. Selects new status (Pending, In Progress, Resolved, or Rejected)
6. Request is sent to API
7. Row is disabled during update
8. Success/error message appears
9. Status is updated in real-time
10. Message auto-clears after 2-3 seconds

## Styling Details

### Dropdown Styling
- Uses color classes from `getStatusColor()` function
- Border matches text color (border-current)
- Responsive sizing (works on mobile, tablet, desktop)
- Focus states for accessibility
- Smooth cursor pointer on hover

### Message Styling
- Green for success: `bg-green-100 text-green-700`
- Red for errors: `bg-red-100 text-red-700`
- Centered text with padding
- Small font size (text-xs)
- Bold font weight (font-medium)

### Disabled State
- Opacity 50% during update
- Cursor changes to not-allowed
- Prevents user interaction

## Technical Details

### State Management
- `updatingStatusId`: Tracks which report is being updated
- `statusMessages`: Dictionary of messages per report ID
- Messages are keyed by report ID to show multiple messages simultaneously

### Error Handling
- API errors are caught and displayed
- Messages auto-clear even on error
- Original status is preserved if update fails

### Performance
- Uses optimistic updates (UI updates immediately)
- Message clearing uses setTimeout for cleanup
- No page reload required

## Compatibility

### Locations
✅ Works on: `/admin/reports` (main list page)
✅ Also available on: `/admin/reports/[id]` (detail page - previously implemented)

### Responsive Design
✅ Desktop (full table view with all columns)
✅ Tablet (may have horizontal scroll)
✅ Mobile (may need adjustments for small screens)

## Future Enhancements

Potential improvements:
1. Add bulk status updates for multiple reports
2. Add status change history/audit log
3. Add comment/note field when changing status
4. Send notifications to report creators on status change
5. Add role-based permissions for different admin actions
6. Add status change confirmation dialog for sensitive actions
7. Add keyboard shortcuts for quick status changes
8. Add status change filters (show only recently changed)
