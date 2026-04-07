# Google Maps Setup Guide

## Overview
The Smart City Reporter now includes Google Maps integration for:
1. **Location Picker** in the "Report Issue" form - Search locations and set coordinates with current location button
2. **Issues Map** in the Dashboard - View all reported issues on a map of North Macedonia

## Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Give it a name (e.g., "Smart City Reporter")
5. Click CREATE

### Step 2: Enable Required APIs
1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
   - **Geolocation API** (optional, for browser geolocation)

### Step 3: Create an API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "API Key"
3. Copy your API key

### Step 4: Add API Key to Your Environment
1. Open `.env.local` in the root of your project
2. Find or add this line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```
3. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key
4. Save the file

### Step 5: Set API Key Restrictions (Optional but Recommended)
1. In Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "API restrictions", select "Restrict key"
4. Select these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
5. Under "Application restrictions", select "HTTP referrers (web sites)"
6. Add your domain (e.g., `localhost:3000` for development)

## Features

### 1. Location Picker on Report Form
When creating a new report (`/create-report`):

- **Search Location**: Type an address or location name in the search field
- **Get Current Location**: Click the "📍 My Location" button to use your device's GPS
- **Select on Map**: Click anywhere on the map to set a location
- **Drag Marker**: Drag the red marker to adjust the location
- **View Coordinates**: The latitude and longitude are displayed below the map

The selected location will automatically fill in:
- Address text
- Latitude value
- Longitude value

### 2. Issues Map on Dashboard
The dashboard (`/dashboard`) now displays an interactive map showing:

- **Report Locations**: All submitted reports are marked with colored pins
- **Status Colors**:
  - 🔵 **Blue**: New issues
  - 🟡 **Yellow**: Pending review
  - 🟠 **Orange**: In Progress
  - 🟢 **Green**: Resolved
  - 🔴 **Red**: Rejected

- **Interactive Features**:
  - Click any marker to view report details
  - Zoom in/out to explore specific areas
  - See full address and status in the info window
  - Click "View Details" to see the full report

- **Map Statistics**: Below the map you'll see:
  - Total number of issues
  - Number of resolved issues
  - Number of in-progress issues
  - Number of pending issues

## Troubleshooting

### "Google Maps API Key Missing" Error
- Make sure you've added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local`
- Restart the development server (`npm run dev`)
- Check that your API key is correct and not a placeholder

### Map Not Loading
- Verify the API key is valid and not expired
- Check that required APIs are enabled in Google Cloud Console:
  - Maps JavaScript API
  - Geocoding API
  - Places API
- Check browser console for any error messages

### Geolocation Not Working
- Make sure your browser has permission to access location
- The "My Location" button requires HTTPS in production (works fine with localhost in development)
- Check browser privacy settings

### Autocomplete Not Suggesting Locations
- The location search is restricted to North Macedonia (country code: 'mk')
- Type in Macedonian or English place names
- Try different address formats

## Environment Variables

```bash
# Required: Your Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://omszejcfxmfmjmfodrkv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

## Files Changed

- `src/components/LocationPicker.tsx` - Location picker component with map
- `src/components/ReportsMap.tsx` - Dashboard map showing all issues
- `app/(citizen)/create-report/page.tsx` - Updated to use LocationPicker
- `app/(citizen)/dashboard/page.tsx` - Updated to use ReportsMap
- `.env.local` - Added Google Maps API key configuration

## Map Bounds
The maps are centered on North Macedonia:
- **Center coordinates**: 41.6086°N, 21.7453°E
- **Default zoom level**: 13 (for location picker), 7 (for dashboard map)
- **Country restriction**: Location search is restricted to North Macedonia
