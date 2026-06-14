-- ============================================================
-- 种子数据：20 个广师大学院种子用户 + 8 条招募帖
-- 密码统一为 demo123456（bcrypt 加密）
-- 在 Supabase SQL Editor 中一次性执行
--
-- 使用方法：
--   1. 打开 Supabase Dashboard → SQL Editor
--   2. 粘贴本文件全部内容
--   3. 点击 Run 执行
--   4. 用户即可用 seed_<拼音>@campus.demo / demo123456 登录
--
-- 注意：
--   - 依赖 pgcrypto 扩展（Supabase 默认已启用）
--   - 使用 ON CONFLICT DO NOTHING，重复执行不会报错
--   - 如果 auth.users 的 encrypted_password 格式在未来 Supabase
--     版本中发生变化，可改用 Supabase Dashboard 手动创建用户，
--     然后仅执行下方 profiles 和 recruitments 的 INSERT 部分
-- ============================================================

-- 确保 pgcrypto 可用（Supabase 默认包含）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- ============================================================
    -- 20 个种子用户 UUID（按用户列表顺序）
    -- ============================================================
    u_01 UUID := gen_random_uuid();  -- 陈思远
    u_02 UUID := gen_random_uuid();  -- 林晓雨
    u_03 UUID := gen_random_uuid();  -- 黄伟杰
    u_04 UUID := gen_random_uuid();  -- 赵敏
    u_05 UUID := gen_random_uuid();  -- 周明辉
    u_06 UUID := gen_random_uuid();  -- 刘诗涵
    u_07 UUID := gen_random_uuid();  -- 吴嘉豪
    u_08 UUID := gen_random_uuid();  -- 孙怡宁
    u_09 UUID := gen_random_uuid();  -- 郑宇轩
    u_10 UUID := gen_random_uuid();  -- 马晓雯
    u_11 UUID := gen_random_uuid();  -- 杨俊杰
    u_12 UUID := gen_random_uuid();  -- 何雨晴
    u_13 UUID := gen_random_uuid();  -- 唐昊天
    u_14 UUID := gen_random_uuid();  -- 徐若兰
    u_15 UUID := gen_random_uuid();  -- 郭俊良
    u_16 UUID := gen_random_uuid();  -- 沈佳琪
    u_17 UUID := gen_random_uuid();  -- 蔡明辉
    u_18 UUID := gen_random_uuid();  -- 曾晓婷
    u_19 UUID := gen_random_uuid();  -- 梁俊熙
    u_20 UUID := gen_random_uuid();  -- 冯悦

    -- 招募帖 UUID（固定值，方便 ON CONFLICT 去重）
    r_01 UUID := 'a0000000-0000-0000-0000-000000000001';
    r_02 UUID := 'a0000000-0000-0000-0000-000000000002';
    r_03 UUID := 'a0000000-0000-0000-0000-000000000003';
    r_04 UUID := 'a0000000-0000-0000-0000-000000000004';
    r_05 UUID := 'a0000000-0000-0000-0000-000000000005';
    r_06 UUID := 'a0000000-0000-0000-0000-000000000006';
    r_07 UUID := 'a0000000-0000-0000-0000-000000000007';
    r_08 UUID := 'a0000000-0000-0000-0000-000000000008';
BEGIN
    -- ============================================================
    -- 阶段 1：创建 auth.users（密码 demo123456，bcrypt 加密）
    -- ============================================================
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        aud, role,
        confirmation_token, recovery_token,
        email_change_token_new, email_change,
        instance_id
    )
    VALUES
    -- 01 陈思远 / 男 / 计算机科学学院 / 大三 / Python,React,MySQL / 找队友打比赛
    (u_01, 'seed_chensiyuan@campus.demo',  crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 02 林晓雨 / 女 / 计算机科学学院 / 大二 / Java,Spring Boot,Vue / 做大创项目
    (u_02, 'seed_linxiaoyu@campus.demo',   crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 03 黄伟杰 / 男 / 机电学院 / 大三 / CAD,SolidWorks,PLC / 做课设
    (u_03, 'seed_huangweijie@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 04 赵敏 / 女 / 机电学院 / 大二 / 机械设计,数控加工 / 做项目
    (u_04, 'seed_zhaomin@campus.demo',     crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 05 周明辉 / 男 / 电子与信息学院 / 大三 / 嵌入式开发,ARM,物联网 / 打电子设计大赛
    (u_05, 'seed_zhouminghui@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 06 刘诗涵 / 女 / 自动化学院 / 大三 / MATLAB,PLC,传感器 / 做毕设
    (u_06, 'seed_liushihan@campus.demo',   crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 07 吴嘉豪 / 男 / 汽车与交通工程学院 / 大二 / CATIA,新能源汽车 / 做大创项目
    (u_07, 'seed_wujiahao@campus.demo',    crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 08 孙怡宁 / 女 / 财经学院 / 大三 / 会计实务,Excel,Python / 找队友打商赛
    (u_08, 'seed_sunyining@campus.demo',   crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 09 郑宇轩 / 男 / 财经学院 / 大二 / 金融分析,Python,税务 / 做项目
    (u_09, 'seed_zhengyuxuan@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 10 马晓雯 / 女 / 管理学院 / 大三 / 市场营销,电商运营,PS / 打市场调研大赛
    (u_10, 'seed_maxiaowen@campus.demo',   crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 11 杨俊杰 / 男 / 管理学院 / 大二 / 人力资源,PPT,数据分析 / 做大创项目
    (u_11, 'seed_yangjunjie@campus.demo',  crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 12 何雨晴 / 女 / 外国语学院 / 大三 / 英语,日语,跨境电商 / 打外语比赛
    (u_12, 'seed_heyuqing@campus.demo',    crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 13 唐昊天 / 男 / 文学与传媒学院 / 大三 / 新媒体运营,PR,文案 / 做自媒体项目
    (u_13, 'seed_tanghaotian@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 14 徐若兰 / 女 / 教育科学学院 / 大二 / 应用心理学,微课制作,数据分析 / 做大创项目
    (u_14, 'seed_xuruolan@campus.demo',    crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 15 郭俊良 / 男 / 网络空间安全学院 / 大三 / Kali,CTF,密码学 / 打CTF比赛
    (u_15, 'seed_guojunliang@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 16 沈佳琪 / 女 / 美术学院 / 大三 / PS,AI,Figma,UI设计 / 做大创项目
    (u_16, 'seed_shenjiaqi@campus.demo',   crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 17 蔡明辉 / 男 / 数学与系统科学学院 / 大三 / MATLAB,数学建模,Python / 打数学建模比赛
    (u_17, 'seed_caiminghui@campus.demo',  crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 18 曾晓婷 / 女 / 光电工程学院 / 大二 / Zemax,光电器件,物理 / 做课设
    (u_18, 'seed_zengxiaoting@campus.demo', crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 19 梁俊熙 / 男 / 法学与知识产权学院 / 大三 / 法律实务,专利撰写,合同法 / 打模拟法庭
    (u_19, 'seed_liangjunxi@campus.demo',  crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000'),

    -- 20 冯悦 / 女 / 音乐学院 / 大三 / 钢琴,声乐,MIDI编曲 / 筹备音乐会
    (u_20, 'seed_fengyue@campus.demo',     crypt('demo123456', gen_salt('bf')), now(),
     '{"provider":"email"}', '{}', now(), now(),
     'authenticated', 'authenticated', '', '', '', '',
     '00000000-0000-0000-0000-000000000000')
    ON CONFLICT (email) DO NOTHING;

    -- ============================================================
    -- 阶段 2：创建 profiles（每个用户对应一条档案记录）
    -- goal 映射说明：
    --   competition = 组队参加比赛
    --   thesis      = 找毕设队友
    --   study       = 找到学习搭子（含课设/项目）
    --   checkin     = 日常打卡监督（含其他活动）
    -- ============================================================
    INSERT INTO profiles (user_id, name, college, grade, skills, goal, wechat)
    VALUES
    -- 01 陈思远
    (u_01, '陈思远', '计算机科学学院', '大三',
     ARRAY['Python', 'React', 'MySQL'], 'competition', 'chen_siyuan2024'),

    -- 02 林晓雨
    (u_02, '林晓雨', '计算机科学学院', '大二',
     ARRAY['Java', 'Spring Boot', 'Vue'], 'competition', 'lin_xiaoyu2024'),

    -- 03 黄伟杰
    (u_03, '黄伟杰', '机电学院', '大三',
     ARRAY['CAD', 'SolidWorks', 'PLC'], 'study', 'huang_weijie2024'),

    -- 04 赵敏
    (u_04, '赵敏', '机电学院', '大二',
     ARRAY['机械设计', '数控加工'], 'study', 'zhao_min2024'),

    -- 05 周明辉
    (u_05, '周明辉', '电子与信息学院', '大三',
     ARRAY['嵌入式开发', 'ARM', '物联网'], 'competition', 'zhou_minghui2024'),

    -- 06 刘诗涵
    (u_06, '刘诗涵', '自动化学院', '大三',
     ARRAY['MATLAB', 'PLC', '传感器'], 'thesis', 'liu_shihan2024'),

    -- 07 吴嘉豪
    (u_07, '吴嘉豪', '汽车与交通工程学院', '大二',
     ARRAY['CATIA', '新能源汽车'], 'competition', 'wu_jiahao2024'),

    -- 08 孙怡宁
    (u_08, '孙怡宁', '财经学院', '大三',
     ARRAY['会计实务', 'Excel', 'Python'], 'competition', 'sun_yining2024'),

    -- 09 郑宇轩
    (u_09, '郑宇轩', '财经学院', '大二',
     ARRAY['金融分析', 'Python', '税务'], 'study', 'zheng_yuxuan2024'),

    -- 10 马晓雯
    (u_10, '马晓雯', '管理学院', '大三',
     ARRAY['市场营销', '电商运营', 'PS'], 'competition', 'ma_xiaowen2024'),

    -- 11 杨俊杰
    (u_11, '杨俊杰', '管理学院', '大二',
     ARRAY['人力资源', 'PPT', '数据分析'], 'competition', 'yang_junjie2024'),

    -- 12 何雨晴
    (u_12, '何雨晴', '外国语学院', '大三',
     ARRAY['英语', '日语', '跨境电商'], 'competition', 'he_yuqing2024'),

    -- 13 唐昊天
    (u_13, '唐昊天', '文学与传媒学院', '大三',
     ARRAY['新媒体运营', 'PR', '文案'], 'study', 'tang_haotian2024'),

    -- 14 徐若兰
    (u_14, '徐若兰', '教育科学学院', '大二',
     ARRAY['应用心理学', '微课制作', '数据分析'], 'competition', 'xu_ruolan2024'),

    -- 15 郭俊良
    (u_15, '郭俊良', '网络空间安全学院', '大三',
     ARRAY['Kali', 'CTF', '密码学'], 'competition', 'guo_junliang2024'),

    -- 16 沈佳琪
    (u_16, '沈佳琪', '美术学院', '大三',
     ARRAY['PS', 'AI', 'Figma', 'UI设计'], 'competition', 'shen_jiaqi2024'),

    -- 17 蔡明辉
    (u_17, '蔡明辉', '数学与系统科学学院', '大三',
     ARRAY['MATLAB', '数学建模', 'Python'], 'competition', 'cai_minghui2024'),

    -- 18 曾晓婷
    (u_18, '曾晓婷', '光电工程学院', '大二',
     ARRAY['Zemax', '光电器件', '物理'], 'study', 'zeng_xiaoting2024'),

    -- 19 梁俊熙
    (u_19, '梁俊熙', '法学与知识产权学院', '大三',
     ARRAY['法律实务', '专利撰写', '合同法'], 'competition', 'liang_junxi2024'),

    -- 20 冯悦
    (u_20, '冯悦', '音乐学院', '大三',
     ARRAY['钢琴', '声乐', 'MIDI编曲'], 'checkin', 'feng_yue2024')
    ON CONFLICT (user_id) DO NOTHING;

    -- ============================================================
    -- 阶段 3：创建 8 条种子招募帖（使用固定 UUID 防止重复插入）
    -- ============================================================

    -- 招募帖 #1：蔡明辉（数学与系统科学学院）— 找 Python 队友打数学建模国赛
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_01,
        '找Python队友打数学建模国赛',
        ARRAY['Python', 'MATLAB', '数据分析'],
        '数学与系统科学学院',
        u_17,
        false,
        now() - interval '2 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #2：林晓雨（计算机科学学院）— 大创项目招前端后端各一人
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_02,
        '大创项目招前端后端各一人',
        ARRAY['React', 'Vue', 'Spring Boot'],
        '计算机科学学院',
        u_02,
        true,
        now() - interval '5 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #3：吴嘉豪（汽车与交通工程学院）— 智能车竞赛找嵌入式队友
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_03,
        '智能车竞赛找嵌入式队友',
        ARRAY['嵌入式开发', 'C++', '传感器'],
        '汽车与交通工程学院',
        u_07,
        false,
        now() - interval '1 day'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #4：何雨晴（外国语学院）— 英语演讲比赛找搭子一起练
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_04,
        '英语演讲比赛找搭子一起练',
        ARRAY['英语', '演讲', 'PPT'],
        '外国语学院',
        u_12,
        false,
        now() - interval '3 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #5：孙怡宁（财经学院）— 商赛组队缺会计方向一人
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_05,
        '商赛组队缺会计方向一人',
        ARRAY['会计实务', 'Excel', '商业计划书'],
        '财经学院',
        u_08,
        true,
        now() - interval '8 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #6：马晓雯（管理学院）— 市场调研大赛已有两人再招一人
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_06,
        '市场调研大赛已有两人再招一人',
        ARRAY['市场营销', '数据分析', 'PS'],
        '管理学院',
        u_10,
        false,
        now() - interval '2 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #7：郭俊良（网络空间安全学院）— CTF战队招新欢迎安全爱好者
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_07,
        'CTF战队招新欢迎安全爱好者',
        ARRAY['CTF', 'Python', 'Linux'],
        '网络空间安全学院',
        u_15,
        true,
        now() - interval '12 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- 招募帖 #8：徐若兰（教育科学学院）— 微课制作项目找视频剪辑队友
    INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
    VALUES (
        r_08,
        '大创项目微课制作找视频剪辑队友',
        ARRAY['PR', 'AE', '动画'],
        '教育科学学院',
        u_14,
        false,
        now() - interval '1 day'
    ) ON CONFLICT (id) DO NOTHING;

END;
$$;

-- ============================================================
-- 验证 SQL（可选，执行完后运行以检查数据）
-- ============================================================
-- 统计 profiles 数量（期望 >= 20）
-- SELECT count(*) AS profile_count FROM profiles WHERE wechat IS NOT NULL;
--
-- 统计招募帖数量（期望 >= 8）
-- SELECT count(*) AS recruitment_count FROM recruitments;
--
-- 查看所有种子用户邮箱（用于分享测试账号）
-- SELECT p.name, p.college, p.grade, u.email
-- FROM profiles p
-- JOIN auth.users u ON u.id = p.user_id
-- WHERE u.email LIKE '%@campus.demo'
-- ORDER BY p.name;
