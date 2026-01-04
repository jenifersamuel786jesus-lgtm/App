
-- Create storage bucket for face photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-8g7cyjjxisxt_face_photos', 'app-8g7cyjjxisxt_face_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload face photos
CREATE POLICY "Authenticated users can upload face photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-8g7cyjjxisxt_face_photos');

-- Allow authenticated users to read face photos
CREATE POLICY "Authenticated users can read face photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'app-8g7cyjjxisxt_face_photos');

-- Allow authenticated users to delete their own face photos
CREATE POLICY "Authenticated users can delete face photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-8g7cyjjxisxt_face_photos');
