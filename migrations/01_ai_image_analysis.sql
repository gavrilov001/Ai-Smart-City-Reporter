-- Supabase Migration: Add AI Image Analysis Support
-- This migration adds the necessary tables and columns for AI-powered image analysis

-- 1. Add ai_analysis column to report_images table
-- This stores the AI analysis results including predicted category and confidence

ALTER TABLE report_images 
ADD COLUMN ai_analysis jsonb DEFAULT NULL;

-- Index for querying AI analysis results
CREATE INDEX idx_report_images_ai_analysis 
ON report_images USING GIN (ai_analysis);

-- 2. Optional: Add AI tracking to reports table
-- These columns track which category was suggested by AI

ALTER TABLE reports
ADD COLUMN ai_suggested_category_id UUID DEFAULT NULL,
ADD COLUMN ai_suggestion_confidence NUMERIC(3,2) DEFAULT NULL;

-- Foreign key constraint for AI suggested category
ALTER TABLE reports
ADD CONSTRAINT fk_reports_ai_suggested_category 
  FOREIGN KEY (ai_suggested_category_id) 
  REFERENCES categories(id) ON DELETE SET NULL;

-- Index for finding AI-categorized reports
CREATE INDEX idx_reports_ai_suggested_category 
ON reports(ai_suggested_category_id) 
WHERE ai_suggested_category_id IS NOT NULL;

-- 3. Optional: Create analytics view for AI performance
-- This view helps track how well the AI is performing

CREATE VIEW ai_analysis_analytics AS
SELECT 
  ai.id as image_id,
  ai.report_id,
  ai.ai_analysis->>'predictedCategory' as predicted_category,
  (ai.ai_analysis->>'confidence')::numeric as confidence,
  r.category_id as actual_category,
  c.name as actual_category_name,
  CASE 
    WHEN r.category_id IS NULL THEN 'not_categorized'
    WHEN r.ai_suggested_category_id = r.category_id THEN 'correct'
    WHEN r.ai_suggested_category_id IS NOT NULL AND r.ai_suggested_category_id != r.category_id THEN 'incorrect'
    ELSE 'uncategorized'
  END as accuracy_status,
  ai.created_at
FROM report_images ai
LEFT JOIN reports r ON ai.report_id = r.id
LEFT JOIN categories c ON r.category_id = c.id
WHERE ai.ai_analysis IS NOT NULL;

-- 4. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE report_images ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own uploaded images
CREATE POLICY "Users can read their own report images"
ON report_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reports 
    WHERE reports.id = report_images.report_id 
    AND reports.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'administrator'
  )
);

-- Allow service role (backend) to insert analyzed images
CREATE POLICY "Service role can insert images with AI analysis"
ON report_images FOR INSERT
WITH CHECK (true);

-- MIGRATION COMPLETE
-- Next steps:
-- 1. Verify all columns and indexes were created: SELECT * FROM information_schema.columns WHERE table_name = 'report_images';
-- 2. Test AI analysis by uploading an image through the UI
-- 3. Check report_images table to verify ai_analysis column is populated
-- 4. View analytics with: SELECT * FROM ai_analysis_analytics;
