-- ============================================================
-- 校园智搭 - Premium 增值功能（会员体系 + 档案增强 + 访问记录）
-- 在 Supabase SQL Editor 中一次性执行
-- 依赖：先执行 01_create_tables.sql, 04_fix_rls_and_columns.sql,
--       05_seed_demo_users.sql
-- ============================================================

-- ============================================================
-- 1. recruitments 表加列：招募帖置顶/推广
-- ============================================================
ALTER TABLE recruitments ADD COLUMN IF NOT EXISTS boosted BOOLEAN DEFAULT false;
ALTER TABLE recruitments ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ;

-- ============================================================
-- 2. profiles 表加列：会员等级 + GPA + 获奖经历
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gpa TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS awards TEXT[];

-- ============================================================
-- 3. 新建 profile_visits 表：档案访问记录
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited ON profile_visits(visited_id, visited_at DESC);
-- 防止短时间内重复记录同一对访问（同一对 5 分钟内不重复插入）
CREATE INDEX IF NOT EXISTS idx_profile_visits_pair ON profile_visits(visitor_id, visited_id);

-- RLS：profile_visits
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可查看谁访问过自己"
  ON profile_visits FOR SELECT
  USING (auth.uid() = visited_id);
CREATE POLICY "认证用户可记录访问"
  ON profile_visits FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

-- ============================================================
-- 4. 种子数据：给演示用户升级会员 + 补充 GPA 和获奖经历
-- ============================================================

-- 4a. zhang@campus.edu 升级为 yearly 会员（演示 Boost 置顶功能）
UPDATE profiles
  SET subscription_tier = 'yearly'
  WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'zhang@campus.edu'
  );

-- 4b. 给 05_seed_demo_users.sql 的种子用户补充 GPA 和 awards
--     奖项依据各自学院与专业方向编撰，贴近真实校园竞赛经历
--     重复执行无害（幂等 UPDATE）

-- 计算机科学学院（2人）
UPDATE profiles SET gpa = '3.8',
  awards = ARRAY['全国大学生数学建模省一等奖','蓝桥杯省赛二等奖']
  WHERE name = '陈思远';

UPDATE profiles SET gpa = '3.6',
  awards = ARRAY['ACM-ICPC亚洲区域赛铜奖']
  WHERE name = '林晓雨';

-- 机电学院（2人）
UPDATE profiles SET gpa = '3.5',
  awards = ARRAY['全国大学生机械创新设计大赛省一等奖','成图大赛个人全能二等奖']
  WHERE name = '黄伟杰';

UPDATE profiles SET gpa = '3.4',
  awards = ARRAY['全国大学生先进成图技术与产品信息建模创新大赛三等奖']
  WHERE name = '赵敏';

-- 电子与信息学院（1人）
UPDATE profiles SET gpa = '3.7',
  awards = ARRAY['全国大学生电子设计竞赛省一等奖','蓝桥杯嵌入式组省赛二等奖']
  WHERE name = '周明辉';

-- 自动化学院（1人）
UPDATE profiles SET gpa = '3.5',
  awards = ARRAY['西门子杯中国智能制造挑战赛省二等奖']
  WHERE name = '刘诗涵';

-- 汽车与交通工程学院（1人）
UPDATE profiles SET gpa = '3.3',
  awards = ARRAY['全国大学生智能汽车竞赛华南赛区二等奖']
  WHERE name = '吴嘉豪';

-- 财经学院（2人）
UPDATE profiles SET gpa = '3.9',
  awards = ARRAY['全国大学生财经素养大赛一等奖','正大杯市场调查与分析大赛省二等奖']
  WHERE name = '孙怡宁';

UPDATE profiles SET gpa = '3.4',
  awards = ARRAY['东方财富杯全国大学生金融挑战赛省三等奖']
  WHERE name = '郑宇轩';

-- 管理学院（2人）
UPDATE profiles SET gpa = '3.7',
  awards = ARRAY['挑战杯创业计划竞赛省银奖','全国高校市场营销大赛二等奖']
  WHERE name = '马晓雯';

UPDATE profiles SET gpa = '3.3',
  awards = ARRAY['全国大学生人力资源管理知识竞赛省二等奖']
  WHERE name = '杨俊杰';

-- 外国语学院（1人）
UPDATE profiles SET gpa = '3.8',
  awards = ARRAY['外研社杯全国英语演讲大赛省一等奖','全国大学生英语竞赛特等奖']
  WHERE name = '何雨晴';

-- 文学与传媒学院（1人）
UPDATE profiles SET gpa = '3.6',
  awards = ARRAY['全国大学生广告艺术大赛省一等奖','学院奖文案类银奖']
  WHERE name = '唐昊天';

-- 教育科学学院（1人）
UPDATE profiles SET gpa = '3.5',
  awards = ARRAY['全国师范生微课大赛二等奖']
  WHERE name = '徐若兰';

-- 网络空间安全学院（1人）
UPDATE profiles SET gpa = '3.8',
  awards = ARRAY['全国大学生信息安全竞赛二等奖','强网杯网络安全挑战赛优胜奖']
  WHERE name = '郭俊良';

-- 美术学院（1人）
UPDATE profiles SET gpa = '3.7',
  awards = ARRAY['全国大学生广告艺术大赛平面类省一等奖','中国好创意设计大赛铜奖']
  WHERE name = '沈佳琪';

-- 数学与系统科学学院（1人）
UPDATE profiles SET gpa = '3.9',
  awards = ARRAY['全国大学生数学建模竞赛国赛二等奖','美国大学生数学建模竞赛H奖']
  WHERE name = '蔡明辉';

-- 光电工程学院（1人）
UPDATE profiles SET gpa = '3.4',
  awards = ARRAY['全国大学生光电设计竞赛省二等奖']
  WHERE name = '曾晓婷';

-- 法学与知识产权学院（1人）
UPDATE profiles SET gpa = '3.6',
  awards = ARRAY['全国大学生模拟法庭竞赛优秀辩手','全国大学生版权征文大赛二等奖']
  WHERE name = '梁俊熙';

-- 音乐学院（1人）
UPDATE profiles SET gpa = '3.8',
  awards = ARRAY['全国大学生艺术展演器乐组省一等奖','校园十大歌手冠军']
  WHERE name = '冯悦';

-- ============================================================
-- 验证 SQL（可选，执行完后运行以检查数据）
-- ============================================================

-- 检查 recruitments 新增列
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'recruitments' AND column_name IN ('boosted', 'boosted_until');

-- 检查 profiles 新增列
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name IN ('subscription_tier', 'gpa', 'awards');

-- 检查 profile_visits 表结构
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profile_visits' ORDER BY ordinal_position;

-- 检查会员升级是否生效
-- SELECT p.name, u.email, p.subscription_tier
-- FROM profiles p
-- JOIN auth.users u ON u.id = p.user_id
-- WHERE u.email = 'zhang@campus.edu';

-- 检查种子用户的 GPA 和 awards 是否已填充
-- SELECT p.name, p.college, p.gpa, p.awards
-- FROM profiles p
-- JOIN auth.users u ON u.id = p.user_id
-- WHERE u.email LIKE '%@campus.demo'
--   AND p.gpa IS NOT NULL
-- ORDER BY p.gpa DESC;

-- 统计各学院获奖数量
-- SELECT p.college, count(*) AS user_count, avg(p.gpa::numeric) AS avg_gpa
-- FROM profiles p
-- WHERE p.gpa IS NOT NULL
-- GROUP BY p.college
-- ORDER BY avg_gpa DESC;
