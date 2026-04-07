# Issue Management Page - Visual Layout

## Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                              │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                    │
│  SIDEBAR     │  HEADER: Issue Management                         │
│              │  Subtitle: Manage and track all reported issues   │
│  Dashboard   │                                                    │
│  Manage      │  User Profile Dropdown (top right)               │
│   Issues ★   │                                                    │
│  Analytics   ├──────────────────────────────────────────────────┤
│  Users       │                                                    │
│  Settings    │  ┌───────────────────────────────────────────┐  │
│              │  │                                           │  │
│              │  │  Issue Management                         │  │
│              │  │  Track and manage all submitted reports   │  │
│              │  │                                           │  │
│              │  │  Stats Summary:                           │  │
│              │  │  ┌─────────────┬──────────────────────┐  │  │
│              │  │  │ All Issues  │ 2 Pending  2 In Prog.│  │  │
│              │  │  │ 5 found     │ 1 Resolved          │  │  │
│              │  │  └─────────────┴──────────────────────┘  │  │
│              │  │                                           │  │
│              │  │  Search Bar:                              │  │
│              │  │  🔍 [Search by title, desc, location] │  │  │
│              │  │                                           │  │
│              │  │  Filters:                                 │  │
│              │  │  [All Statuses ▼] [All Categories ▼]    │  │
│              │  │                                           │  │
│              │  │  Results: All Issues (5 issues found)     │  │
│              │  │                                           │  │
│              │  ├───────────────────────────────────────────┤  │
│              │  │                                           │  │
│              │  │ DATA TABLE:                               │  │
│              │  │                                           │  │
│              │  │ ┌─────────────────────────────────────┐  │  │
│              │  │ │Issue │Cat │Location │Reporter │Date │  │  │
│              │  │ ├─────────────────────────────────────┤  │  │
│              │  │ │Pot...│      │Main St  │John D. │4/6 │  │  │
│              │  │ │Crack │Transport│        │        │   │  │  │
│              │  │ │      │         │        │        │   │  │  │
│              │  │ │ [View] [Delete] │ [Status Badge] │  │  │
│              │  │ ├─────────────────────────────────────┤  │  │
│              │  │ │Street...│Roads   │5th Ave  │Jane   │4/5│  │  │
│              │  │ │Flooding │        │        │Smith  │   │  │  │
│              │  │ │         │        │        │       │   │  │  │
│              │  │ │ [View] [Delete] │ [Status Badge] │  │  │
│              │  │ └─────────────────────────────────────┘  │  │
│              │  │                                           │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                    │
└──────────────┴──────────────────────────────────────────────────┘
```

## Search & Filter Interaction

```
Input: Search by title, description, or location...
       ↓
Filters: Status (all/pending/in progress/resolved)
         Category (all/roads/utilities/safety/...)
         ↓
Result: Table updates in real-time
        Shows filtered issues only
```

## Delete Action Flow

```
User clicks Delete button
       ↓
Confirmation Modal appears:
┌─────────────────────────────┐
│  🚨 Delete Issue?            │
│                              │
│  This action cannot be       │
│  undone. Data will be        │
│  permanently deleted.        │
│                              │
│  [Cancel]      [Delete 🔴]   │
└─────────────────────────────┘
       ↓
    If Delete:
    POST DELETE /api/admin/issues/{id}
       ↓
    Success → Remove from table
    Error   → Show error message
```

## Color Scheme

```
Pending:      🟨 Yellow  (bg-yellow-100, text-yellow-800)
In Progress:  🔵 Blue    (bg-blue-100, text-blue-800)
Resolved:     🟢 Green   (bg-green-100, text-green-800)

Backgrounds:
- Main Container:  White (bg-white) with rounded-3xl
- Filter Area:     Gray (bg-gray-50)
- Table Header:    Gray (bg-gray-50)
- Table Rows:      White (bg-white) alternating
- Button Hover:    Gray (bg-gray-200)
- Delete Hover:    Light Red (bg-red-100)
```

## Component Hierarchy

```
ManageIssuesPage (Client Component)
├── Sidebar Navigation
│   ├── Logo
│   ├── Nav Links (Dashboard, Manage Issues*, Analytics, Users, Settings)
│   └── Profile Section
├── Main Content Area
│   ├── Header Section
│   │   ├── Page Title
│   │   └── User Profile Dropdown
│   └── Content Container (rounded-3xl)
│       ├── Page Header Section
│       │   ├── Title + Subtitle
│       │   └── Stats Summary Badges (Pending, In Progress, Resolved)
│       ├── Search & Filter Bar
│       │   ├── Search Input with Icon
│       │   ├── Status Dropdown
│       │   └── Category Dropdown
│       ├── Results Counter
│       └── Data Table / Empty State
│           ├── Loading Spinner
│           ├── Empty State Message
│           └── Table
│               ├── Header Row
│               └── Data Rows with Actions
└── Delete Confirmation Modal (Overlay)
    ├── Alert Icon
    ├── Confirmation Message
    └── Action Buttons
```

## Key Features Matrix

| Feature | Status | Implementation |
|---------|--------|-----------------|
| Search | ✅ | Real-time across title, description, address |
| Status Filter | ✅ | Dropdown with 5 options |
| Category Filter | ✅ | Dynamic from database |
| Combined Filters | ✅ | All work together |
| View Button | ✅ | Navigate to `/admin/reports/{id}` |
| Delete Button | ✅ | Confirmation modal + API call |
| Responsive Design | ✅ | Mobile-friendly grid layout |
| Loading States | ✅ | Spinner while fetching |
| Empty States | ✅ | Message when no results |
| Confirmation Dialog | ✅ | Custom modal with animations |
| Real-time Updates | ✅ | State updates on delete |
| Icons | ✅ | Lucide React (Search, Eye, Trash, Alert) |
| Error Handling | ✅ | Alerts on API failures |
| User Profile | ✅ | Dropdown with logout |

## Responsive Breakpoints

```
Mobile (< 640px):
  - Sidebar hidden
  - Search/Filters stack vertically
  - Table horizontal scroll
  - Single column layout
  
Tablet (640px - 1024px):
  - Sidebar visible on tap
  - 2-column filter layout
  - Table horizontal scroll
  
Desktop (> 1024px):
  - Sidebar always visible
  - 3-column filter layout
  - Full table visible
  - All features accessible
```

## API Endpoints Used

```
GET /api/reports
- Fetch all reports for the table
- Returns: { status: 'success', data: Report[], count: number }

DELETE /api/admin/issues/:id
- Delete a specific issue
- Returns: { message: 'Issue deleted successfully', data: Report }
```
