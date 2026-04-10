-- AI FEATURE TEST GUIDE

QUICK TEST (5 MINUTES):

1. Start server:
   npm run dev

2. Go to: http://localhost:3000/create-report

3. Fill form:
   - Title: "Test Pothole"
   - Description: "Road damage test"
   - Pick location on map
   - Category: (leave empty - AI will fill it)
   - Image: Upload clear photo of road, graffiti, trash, etc.

4. Click Submit

5. Watch for notification at top:
   ✨ AI detected: Road Damage (92% confidence)

6. Check database to verify:
   - Go to Supabase Dashboard
   - Table: report_images
   - Look for ai_analysis column
   - Should show JSON with predictedCategory, confidence, rawLabel


EXPECTED FLOW:

User uploads image
    ↓
Backend sends to Hugging Face
    ↓
Gets "pothole detected" response
    ↓
Maps to "Road Damage" category
    ↓
Returns with 92% confidence
    ↓
Frontend shows success notification
    ↓
Report saved with AI analysis


WHAT TO LOOK FOR:

✅ Image uploads successfully
✅ AI notification appears (green success message)
✅ Shows category and confidence %
✅ Report created and saved
✅ Check report_images.ai_analysis in database has data


IF AI DOESN'T WORK:

1. Check console (F12):
   - Should show no JS errors
   - Should show network request to /api/reports/upload-image

2. Check server logs (npm run dev output):
   - Should show "Error analyzing image" or success message
   - If error: HF_API_KEY might be wrong

3. Verify HF_API_KEY:
   - grep HF_API_KEY .env.local
   - Should show: HF_API_KEY=hf_...

4. Try different image:
   - Use clear, well-lit photos
   - Avoid blurry or dark images


DATABASE VERIFICATION:

After uploading, run in Supabase SQL:

SELECT 
  id, 
  image_url, 
  ai_analysis 
FROM public.report_images 
ORDER BY uploaded_at DESC 
LIMIT 1;

Should show ai_analysis column with:
{
  "predictedCategory": "Road Damage",
  "confidence": 0.92,
  "rawLabel": "pothole"
}
