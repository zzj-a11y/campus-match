-- 为已有的 profiles 表添加 name 列
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
