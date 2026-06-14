-- profiles 加 avatar_url 列
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Supabase Storage：建 avatars bucket（需在 Supabase Dashboard 操作）
-- 手动步骤：
-- 1. Supabase Dashboard → Storage → New Bucket
-- 2. Name: avatars, 勾选 "Public bucket"
-- 3. 在 bucket 的 Policies 中添加：
--    INSERT: 允许 authenticated 用户（WITH CHECK: auth.role() = 'authenticated'）
--    SELECT: 允许所有人
