-- ============================================================
-- 校园智搭 - 双等级置顶（标准 / 超级）
-- 在 Supabase SQL Editor 中执行
-- 依赖：先执行 08_premium_features.sql（boosted / boosted_until 列）
-- ============================================================

ALTER TABLE recruitments ADD COLUMN IF NOT EXISTS boost_level TEXT DEFAULT 'standard';

-- 验证
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'recruitments' AND column_name = 'boost_level';
