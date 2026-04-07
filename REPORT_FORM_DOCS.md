# Report an Issue Feature Documentation

## Overview
The "Report an Issue" form is a complete full-stack feature that allows citizens to report problems in their city. The form includes image upload, category selection, location input, and seamless backend integration with Supabase.

## File Structure

```
app/
├── (citizen)/
│   └── create-report/
│       └── page.tsx              # Main Report Form Component
├── api/
│   └── reports/
│       ├── create/
│       │   └── route.ts          # Report creation endpoint
│       └── upload-image/
│           └── route.ts          # Image upload endpoint
```

## Frontend Components

### `app/(citizen)/create-report/page.tsx`

A complete React component that handles:

#### State Management
- **formData**: Contains title, description, category, location, latitude, longitude
- **selectedFile**: Stores the uploaded image file
- **previewUrl**: Displays image preview before submission
- **isLoading**: Manages button disabled state during submission
- **notification**: Shows success/error messages
- **categories**: Lists available categories from backend
- **userProfile**: Displays logged-in user information

#### Features

1. **User Profile Display**
   - Fetches user data from localStorage
   - Shows user initials and name in header

2. **Form Fields**
   - **Issue Title**: Text input with required validation
   - **Description**: Textarea with detailed issue description
   - **Category**: Dropdown with dynamically loaded categories
   - **Location**: Text input with location pin icon
   - **Image Upload**: Drag-and-drop file upload with preview

3. **Image Upload Dropzone**
   - Drag-and-drop support
   - Click to browse files
   - Image preview with remove functionality
   - File size validation (max 5MB)
   - File type validation (images only)

4. **Form Validation**
   - Required field validation
   - File validation before submission
   - Error messages displayed in toast notifications
   - Disabled form inputs during submission

5. **Responsive Design**
   - Sidebar hidden on mobile (visible on lg screens)
   - Flexible header layout
   - Mobile-optimized form spacing
   - Touch-friendly input fields

#### Form Submission Flow

```
User Fills Form
    ↓
Validates Input & File
    ↓
User Clicks Submit
    ↓
Create Report (API Call #1)
    ↓
Upload Image (API Call #2)
    ↓
Success Toast + Redirect to Dashboard
```

## Backend Endpoints

### 1. Create Report Endpoint
**Path**: `POST /api/reports/create`

#### Request
```typescript
// FormData format
{
  title: string;
  description: string;
  category_id: string;
  address: string;
  user_id: string;
  latitude?: string;
  longitude?: string;
}
```

#### Response
```typescript
{
  status: "success" | "error";
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    category_id: string;
    user_id: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    status: "new";
    created_at: string;
    updated_at: string;
  }
}
```

#### Features
- Accepts both JSON and FormData
- Makes latitude/longitude optional
- Auto-converts string coordinates to numbers
- Sets initial status to "new"
- Returns created report with all details

### 2. Image Upload Endpoint
**Path**: `POST /api/reports/upload-image`

#### Request
```typescript
FormData {
  image: File;
  report_id: string;
}
```

#### Response
```typescript
{
  status: "success" | "error";
  message: string;
  data: {
    id: string;
    report_id: string;
    image_url: string;
    uploaded_at: string;
  }
}
```

#### Features
- Uploads image to Supabase Storage (bucket: `report-images`)
- Generates public URL for the image
- Creates database record in `report_images` table
- Handles errors gracefully without breaking report creation
- Optimized file naming: `${reportId}-${timestamp}-${originalName}`

## API Integration Details

### Axios Configuration
- Uses axios for all HTTP requests
- Content-Type automatically set based on data type
- Error handling with try-catch blocks
- Proper error message extraction from backend responses

### Supabase Integration
- Uses `createSupabaseClient()` from `/lib/supabaseClient.ts`
- Stores images in `report-images` bucket
- Saves metadata in `report_images` table
- Stores report data in `reports` table

### Authentication
- Fetches user ID from localStorage (set during login)
- Passes user_id in report creation request
- Links reports to authenticated users

## Error Handling

### Frontend Error Messages
1. **Empty Title**: "Please enter an issue title"
2. **Empty Description**: "Please enter a description"
3. **No Category**: "Please select a category"
4. **No Location**: "Please enter a location"
5. **No Image**: "Please upload an image"
6. **User Not Authenticated**: "User not authenticated"
7. **Invalid Image Type**: "Please select a valid image file"
8. **Large File**: "Image size must be less than 5MB"
9. **Backend Errors**: Extracted from API response

### Toast Notifications
- Success: Green background (emerald-500)
- Error: Red background (red-500)
- Duration: 4 seconds auto-dismiss
- Position: Top-right corner
- Z-index: 50 (above all content)

## UI/UX Features

### Design System
- **Color Scheme**: Cyan-to-emerald gradient for primary actions
- **Typography**: Bold dark navy for headings, muted grey for helpers
- **Spacing**: Responsive padding (4px on mobile, 32px on desktop)
- **Shadows**: Subtle shadow on form card
- **Border Radius**: Consistent 3xl (48px) for main card, xl (12px) for elements

### Interactive Elements
1. **Buttons**
   - Primary: Gradient cyan-to-emerald with hover effect
   - Secondary: Red background with white text (remove image)
   - Disabled state during loading with spinner

2. **Input Fields**
   - Light grey background on focus: teal ring
   - Smooth transitions
   - Placeholder text in muted grey
   - Disabled during submission

3. **Dropzone**
   - Dashed border styling
   - Hover effect (border color + background)
   - Cloud upload icon
   - Preview image display with remove button

## AI Classification Placeholder

The component includes a commented example for AI-powered category classification:

```typescript
// TODO: Integrate AI classification API to auto-detect category based on description
const aiClassifyCategory = async (description: string) => {
  try {
    const response = await axios.post('/api/ai/classify-category', { 
      description 
    });
    setFormData(prev => ({
      ...prev,
      category: response.data.category_id,
    }));
  } catch (error) {
    console.error('Error classifying category:', error);
  }
};
```

To implement:
1. Create endpoint: `POST /api/ai/classify-category`
2. Call on description blur or after typing stops
3. Auto-populate category dropdown

## Testing Checklist

- [ ] Form validates all required fields
- [ ] Image preview works with drag-and-drop
- [ ] Image preview works with file browser
- [ ] File size validation works (>5MB)
- [ ] File type validation works (non-images)
- [ ] Form disables during submission
- [ ] Spinner shows in button during loading
- [ ] Success message shows and redirects
- [ ] Error messages display correctly
- [ ] Categories load from backend
- [ ] User profile displays correctly
- [ ] Responsive on mobile (sidebar hidden)
- [ ] Responsive on tablet (sidebar visible)
- [ ] Responsive on desktop
- [ ] Image uploads to Supabase Storage
- [ ] Image record saved to database
- [ ] Report created with correct status "new"

## Security Considerations

1. **File Upload**
   - Client-side validation (type & size)
   - Server-side validation in upload endpoint
   - Secure filename generation (timestamp + random)
   - Stored in dedicated S3 bucket with access controls

2. **Authentication**
   - User ID fetched from localStorage (verified during login)
   - Backend should verify user token
   - Reports linked to authenticated user

3. **Data Validation**
   - All required fields validated
   - Category ID checked against database
   - User ID verified

## Future Enhancements

1. **Geolocation Integration**
   - Fetch user's current coordinates
   - Display map with marker
   - Address autocomplete from coordinates

2. **AI Features**
   - Auto-detect category from description
   - AI-powered image analysis
   - Automatic report severity assessment

3. **Multiple Images**
   - Support uploading multiple images
   - Image gallery preview
   - Image compression before upload

4. **Rich Text Editor**
   - Markdown support in description
   - Text formatting options
   - Spell check integration

5. **Offline Support**
   - Save draft reports locally
   - Queue for upload when online
   - Sync mechanism

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Dependencies

- `axios`: HTTP client for API requests
- `react`: UI framework
- `next`: Framework for routing and server components
- `tailwindcss`: Styling utility

## Related Components

- Dashboard: `/app/(citizen)/dashboard/page.tsx`
- Login: `/app/(auth)/login/page.tsx`
- Categories API: `/app/api/categories/route.ts`

