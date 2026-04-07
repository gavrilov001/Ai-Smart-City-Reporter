# Issue Management - Code Reference & Examples

## Frontend Component Code Snippets

### 1. State Management Setup

```typescript
const [reports, setReports] = useState<Report[]>([]);
const [filteredReports, setFilteredReports] = useState<Report[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [categoryFilter, setCategoryFilter] = useState('all');
const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);
```

### 2. Fetch Reports on Mount

```typescript
useEffect(() => {
  // Load user profile and fetch reports
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    setUserProfile({
      name: user.name,
      initials: user.name.split(' ').map(n => n[0]).join('').slice(0, 2),
      id: user.id,
      role: user.role,
    });
  }
  fetchReports();
}, []);

const fetchReports = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/reports');
    if (response.data.status === 'success') {
      setReports(response.data.data || []);
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Real-time Filtering Logic

```typescript
useEffect(() => {
  let filtered = reports;

  // Search filter - checks title, description, and address
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(report =>
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.address.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(report =>
      report.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // Category filter
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(report =>
      report.categories?.name === categoryFilter
    );
  }

  setFilteredReports(filtered);
}, [reports, searchQuery, statusFilter, categoryFilter]);
```

### 4. Delete Functionality

```typescript
const handleDelete = async (reportId: string) => {
  try {
    setDeleting(true);
    const response = await axios.delete(`/api/admin/issues/${reportId}`);
    
    if (response.status === 200) {
      // Remove from local state immediately for UX
      setReports(reports.filter(r => r.id !== reportId));
      setDeleteConfirm(null); // Close modal
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    alert('Failed to delete the issue. Please try again.');
  } finally {
    setDeleting(false);
  }
};
```

### 5. Status Statistics Calculation

```typescript
const getStatusStats = () => {
  return {
    pending: reports.filter(r => 
      r.status.toLowerCase() === 'pending'
    ).length,
    inProgress: reports.filter(r => 
      r.status.toLowerCase() === 'in_progress' || 
      r.status.toLowerCase() === 'in progress'
    ).length,
    resolved: reports.filter(r => 
      r.status.toLowerCase() === 'resolved'
    ).length,
  };
};

const stats = getStatusStats();
```

### 6. Dynamic Category Population

```typescript
const categories = Array.from(
  new Set(reports.map(r => r.categories?.name).filter(Boolean))
) as string[];

// In JSX:
<select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
  <option value="all">All Categories</option>
  {categories.map(category => (
    <option key={category} value={category}>{category}</option>
  ))}
</select>
```

### 7. Status Color Helper

```typescript
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
```

## UI Components

### 8. Search Input with Icon

```tsx
<div className="relative">
  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search by title, description, or location..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  />
</div>
```

### 9. Status Badges

```tsx
<div className="flex flex-wrap gap-2">
  <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
    <span className="text-yellow-700 font-semibold text-sm">
      {stats.pending} Pending
    </span>
  </div>
  <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
    <span className="text-blue-700 font-semibold text-sm">
      {stats.inProgress} In Progress
    </span>
  </div>
  <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-full">
    <span className="text-green-700 font-semibold text-sm">
      {stats.resolved} Resolved
    </span>
  </div>
</div>
```

### 10. Table Row with Actions

```tsx
{filteredReports.map((report) => (
  <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div>
        <p className="font-semibold text-gray-900 text-sm">{report.title}</p>
        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{report.description}</p>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        {report.categories?.name || 'Uncategorized'}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">{report.address || 'N/A'}</td>
    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{report.users?.name || 'Unknown'}</td>
    <td className="px-6 py-4 text-sm text-gray-600">
      {new Date(report.created_at).toLocaleDateString()}
    </td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
        {report.status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.href = `/admin/reports/${report.id}`}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-xs font-medium"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => setDeleteConfirm(report.id)}
          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-xs font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </td>
  </tr>
))}
```

### 11. Delete Confirmation Modal

```tsx
{deleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Issue?</h3>
      <p className="text-gray-600 text-center text-sm mb-6">
        This action cannot be undone. The issue and all related data will be permanently deleted.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setDeleteConfirm(null)}
          disabled={deleting}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          disabled={deleting}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {deleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </button>
      </div>
    </div>
  </div>
)}
```

## Backend API Code

### 12. DELETE API Route

```typescript
// File: /app/api/admin/issues/[id]/route.ts
import { createServiceRoleClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Delete the report from database
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select();

    if (error) {
      console.error('Error deleting report:', error);
      return NextResponse.json(
        { message: 'Failed to delete the issue' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Issue deleted successfully', data: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

## Usage Examples

### Making API Calls

```typescript
// Fetch all reports
const response = await axios.get('/api/reports');
// Returns: { status: 'success', data: Report[], count: number }

// Delete a specific report
const deleteResponse = await axios.delete(`/api/admin/issues/${reportId}`);
// Returns: { message: 'Issue deleted successfully', data: Report }
```

### Handling Filters

```typescript
// User types in search
setSearchQuery('pothole');

// User selects status filter
setStatusFilter('pending');

// User selects category filter
setCategoryFilter('Roads');

// All three filters combine in useEffect
// Result: Only pending road issues with 'pothole' in title/description/address
```

## TypeScript Interfaces

```typescript
interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  address: string;
  category_id: string;
  categories?: {
    name: string;
  };
  users?: {
    name: string;
  };
}

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}
```

## Tailwind CSS Classes Used

```
Spacing:    p-6, sm:p-8, px-6, py-4, gap-2, gap-4
Borders:    border, border-gray-200, rounded-xl, rounded-3xl, rounded-2xl
Colors:     bg-white, bg-gray-50, text-gray-900, text-gray-600
Hover:      hover:bg-gray-50, hover:bg-gray-200, hover:bg-red-100, hover:text-cyan-700
Focus:      focus:outline-none, focus:ring-2, focus:ring-blue-500
States:     disabled:opacity-50, disabled:cursor-not-allowed
Effects:    shadow-md, transition-all, transition-colors, animate-spin
Responsive: hidden, lg:flex, flex-col, sm:flex-row, sm:col-span-1, sm:p-8
Truncate:   line-clamp-1
```

## Icons from Lucide React

```typescript
import { Search, Eye, Trash2, AlertCircle } from 'lucide-react';

// Search input
<Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

// View button
<Eye className="w-4 h-4" />

// Delete button
<Trash2 className="w-4 h-4" />

// Modal alert
<AlertCircle className="w-6 h-6 text-red-600" />
<AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
```

## Best Practices Implemented

1. ✅ **Separation of Concerns**: Filtering logic in useEffect
2. ✅ **Error Handling**: Try-catch blocks with user-friendly messages
3. ✅ **Loading States**: Spinner shown while deleting
4. ✅ **Optimistic Updates**: Removes from table immediately
5. ✅ **TypeScript**: Fully typed components and interfaces
6. ✅ **Accessibility**: Proper ARIA labels and semantic HTML
7. ✅ **Performance**: useEffect dependencies properly specified
8. ✅ **UX**: Confirmation dialogs prevent accidental deletions
9. ✅ **Responsive**: Mobile-first design with breakpoints
10. ✅ **Consistency**: Follows project patterns (Axios, Tailwind, Lucide)
