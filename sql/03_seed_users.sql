-- ============================================================
-- 种子数据：创建 8 个预设队友（密码统一为 123456）
-- 在 Supabase SQL Editor 中一次性执行
-- ============================================================

-- 确保 pgcrypto 可用
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    uid1 UUID := gen_random_uuid();
    uid2 UUID := gen_random_uuid();
    uid3 UUID := gen_random_uuid();
    uid4 UUID := gen_random_uuid();
    uid5 UUID := gen_random_uuid();
    uid6 UUID := gen_random_uuid();
    uid7 UUID := gen_random_uuid();
    uid8 UUID := gen_random_uuid();
BEGIN
    -- ============================================================
    -- 1. 创建 auth.users（密码都是 123456，bcrypt 加密）
    -- ============================================================
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role, confirmation_token, recovery_token, email_change_token_new, email_change, instance_id)
    VALUES
    (uid1, 'zhang@campus.edu',   crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid2, 'li@campus.edu',      crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid3, 'wang@campus.edu',    crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid4, 'zhao@campus.edu',    crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid5, 'liu@campus.edu',     crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid6, 'chen@campus.edu',    crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid7, 'zhou@campus.edu',    crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000'),
    (uid8, 'wu@campus.edu',      crypt('123456', gen_salt('bf')), now(), '{"provider":"email"}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '', '00000000-0000-0000-0000-000000000000');

    -- ============================================================
    -- 2. 创建 profiles 档案
    -- ============================================================
    INSERT INTO profiles (user_id, name, college, grade, skills, goal)
    VALUES
    (uid1, '张同学', '计算机学院', '大三', ARRAY['Python', '数据分析', 'PPT'],         'competition'),
    (uid2, '李同学', '经管学院',   '大二', ARRAY['商业计划书', 'Excel', '演讲'],        'competition'),
    (uid3, '王同学', '设计学院',   '大三', ARRAY['Figma', 'UI 设计', '摄影'],           'competition'),
    (uid4, '赵同学', '计算机学院', '大四', ARRAY['Java', 'Spring Boot', 'MySQL'],       'thesis'),
    (uid5, '刘同学', '人文学院',   '大二', ARRAY['写作', '文案', 'PPT'],                'competition'),
    (uid6, '陈同学', '理工学院',   '大三', ARRAY['Python', '机器学习', '数据分析'],      'study'),
    (uid7, '周同学', '经管学院',   '大三', ARRAY['英语', '数学', 'Excel'],              'checkin'),
    (uid8, '吴同学', '设计学院',   '大二', ARRAY['PS', 'AI', '摄影'],                   'study');

END;
$$;
