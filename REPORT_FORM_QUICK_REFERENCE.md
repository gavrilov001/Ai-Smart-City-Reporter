# Report an Issue Feature - Quick Reference

## 📋 Component Overview

A complete full-stack "Report an Issue" form with:
- ✅ Responsive design (mobile-first)
- ✅ Image upload with drag-drop
- ✅ Real-time preview
- ✅ Form validation
- ✅ Loading states
- ✅ Toast notifications
- ✅ Supabase integration

## 🎯 Key Features

### Frontend (`app/(citizen)/create-report/page.tsx`)

| Feature | Details |
|---------|---------|
| **Form Fields** | Title, Description, Category, Location, Image |
| **Validation** | Required fields, file type/size checks |
| **File Upload** | Drag-drop or click, max 5MB, image only |
| **Preview** | Real-time image preview with remove button |
| **Sidebar** | Responsive (hidden on mobile, visible on lg) |
| **User Profile** | Fetched from localStorage, displayed in header |
| **Notifications** | Toast messages (success/error) auto-dismiss after 4s |
| **Categories** | Dynamically loaded from `/api/categories` |

### Backend Endpoints

#### 1. Create Report
- **URL**: `POST /api/reports/create`
- **Content-Type**: `multipart/form-data`
- **Required Fields**: `title`, `description`, `category_id`, `user_id`, `address`
- **Optional Fields**: `latitude`, `longitude`
- **Response**: Created report object with ID

#### 2. Upload Image
- **URL**: `POST /api/reports/upload-image`
- **Content-Type**: `multipart/form-data`
- **Required Fields**: `image` (File), `report_id`
- **Storage**: Supabase `report-images` bucket
- **Response**: Image URL and database record

## 🔄 Data Flow

```
1. User fills form & selects image
   ↓
2. Click "Submit Report"
   ↓
3. Frontend validation
   ↓
4. POST /api/reports/create (FormData)
   ↓
5. Backend creates report, returns ID
   ↓
6. POST /api/reports/upload-image with report ID
   ↓
7. Backend uploads to storage, saves record
   ↓
8. Toast success, redirect to dashboard
```

## 📱 Responsive Breakpoints

| Screen Size | Layout |
|------------|--------|
| Mobile (<768px) | Sidebar hidden, full-width form |
| Tablet (768-1024px) | Sidebar hidden, centered form |
| Desktop (>1024px) | Sidebar visible, main content area |

## 🎨 Styling

- **Primary Color**: Cyan-to-Emerald gradient (`from-cyan-500 to-emerald-500`)
- **Form Background**: White with rounded corners (rounded-3xl)
- **Shadow**: Subtle shadow on card
- **Focus State**: Teal ring (focus:ring-2 focus:ring-teal-500)
- **Icons**: SVG-based throughout

## ⚠️ Error Messages

| Scenario | Message |
|----------|---------|
| Empty title | "Please enter an issue title" |
| Empty description | "Please enter a description" |
| No category | "Please select a category" |
| No location | "Please enter a location" |
| No image | "Please upload an image" |
| Invalid image | "Please select a valid image file" |
| File too large | "Image size must be less than 5MB" |
| Not authenticated | "User not authenticated" |
| Server error | "Failed to submit report. Please try again." |

## 🚀 Getting Started

### 1. Dependencies
```bash
npm install axios
```

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Database Setup
- `reports` table must exist (auto-created from schema)
- `report_images` table must exist
- `categories` table with id and name
- Supabase storage bucket: `report-images`

### 4. Navigate to Form
- Direct URL: `/create-report`
- Via sidebar: Click "Report Issue" link
- From dashboard: Click action button

## 💡 Code Example: Using the Form

```typescript
// User navigates to /create-report
// Form is automatically displayed
// User fills in details and uploads image
// Click "Submit Report"
// Form submits to /api/reports/create
// Image uploads to /api/reports/upload-image
// Success notification + redirect to /dashboard
```

## 🔧 Customization

### Change Primary Color
Replace `cyan-500` and `emerald-500` with your brand colors throughout the file.

### Change Form Layout
Modify the grid layout in the main form card section.

### Add More Fields
1. Add to `FormData` interface
2. Add to form state
3. Add input field to JSX
4. Add to validation
5. Add to API request

### AI Category Detection
Uncomment and implement the `aiClassifyCategory` function to auto-detect categories.

## 🧪 Testing

### Manual Testing
1. ✅ Fill all fields with valid data
2. ✅ Upload valid image
3. ✅ Submit form
4. ✅ Check success notification
5. ✅ Verify redirect to dashboard
6. ✅ Check Supabase database for new report
7. ✅ Check storage bucket for image

### Validation Testing
1. ✅ Try submitting with empty title
2. ✅ Try submitting without image
3. ✅ Try uploading >5MB file
4. ✅ Try uploading non-image file
5. ✅ Try submitting without category

## 📊 API Response Examples

### Successful Report Creation
```json
{
  "status": "success",
  "message": "Report created successfully",
  "data": {
    "id": "uuid",
    "title": "Pothole on Main Street",
    "description": "Large pothole...",
    "category_id": "category-uuid",
    "user_id": "user-uuid",
    "address": "Main Street, City",
    "status": "new",
    "created_at": "2024-04-07T10:30:00Z"
  }
}
```

### Successful Image Upload
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "id": "image-uuid",
    "report_id": "report-uuid",
    "image_url": "https://bucket.supabase.co/reports/...",
    "uploaded_at": "2024-04-07T10:31:00Z"
  }
}
```

## 🔐 Security Notes

- File uploads validated on both client and server
- User authentication required (from localStorage)
- Unique filenames prevent collisions
- Images stored in dedicated Supabase bucket
- All inputs sanitized by Supabase

## 📚 Related Files

- Categories API: `app/api/categories/route.ts`
- Dashboard: `app/(citizen)/dashboard/page.tsx`
- Login: `app/(auth)/login/page.tsx`
- Supabase Client: `lib/supabaseClient.ts`

---

**Status**: ✅ Production Ready  
**Last Updated**: April 2024  
**Version**: 1.0.0
