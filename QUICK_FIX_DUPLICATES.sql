-- FINAL FIX: Handle duplicates with foreign key constraints
-- This handles reports that reference duplicate categories

-- Step 1: Find duplicate categories
SELECT name, COUNT(*) as count FROM public.categories GROUP BY name HAVING COUNT(*) > 1;

-- Step 2: For each duplicate, keep the FIRST one and update reports to use it
-- Get duplicate "Pothole" - keep first, reassign others
WITH pothole_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.categories
  WHERE LOWER(TRIM(name)) = 'pothole'
)
UPDATE public.reports
SET category_id = (SELECT id FROM pothole_dupes WHERE rn = 1)
WHERE category_id IN (SELECT id FROM pothole_dupes WHERE rn > 1);

-- Now delete the duplicate potholes
WITH pothole_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.categories
  WHERE LOWER(TRIM(name)) = 'pothole'
)
DELETE FROM public.categories
WHERE id IN (SELECT id FROM pothole_dupes WHERE rn > 1);

-- Step 3: Do same for "Water Leak" - keep first, reassign others
WITH water_leak_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.categories
  WHERE LOWER(TRIM(name)) = 'water leak'
)
UPDATE public.reports
SET category_id = (SELECT id FROM water_leak_dupes WHERE rn = 1)
WHERE category_id IN (SELECT id FROM water_leak_dupes WHERE rn > 1);

-- Delete duplicate water leaks
WITH water_leak_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.categories
  WHERE LOWER(TRIM(name)) = 'water leak'
)
DELETE FROM public.categories
WHERE id IN (SELECT id FROM water_leak_dupes WHERE rn > 1);

-- Step 4: Handle any other duplicates
WITH ranked_cats AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at) as rn
  FROM public.categories
)
DELETE FROM public.categories
WHERE id IN (SELECT id FROM ranked_cats WHERE rn > 1);

-- Step 5: Standardize "Water Leak" to "Flooding"
UPDATE public.categories 
SET name = 'Flooding' 
WHERE LOWER(TRIM(name)) = 'water leak';

-- Step 6: Verify all duplicates are gone
SELECT name, COUNT(*) as count FROM public.categories GROUP BY name ORDER BY name;

-- Step 7: Final count
SELECT COUNT(*) as total_categories FROM public.categories;

-- Step 8: View all categories
SELECT id, name FROM public.categories ORDER BY name;
