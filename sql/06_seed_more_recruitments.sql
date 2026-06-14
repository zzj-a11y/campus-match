-- ============================================================
-- 种子数据：30 条补充招募帖（丰富招募广场内容）
-- 依赖：先执行 05_seed_demo_users.sql 创建 20 个种子用户
--
-- 使用方法：
--   1. 先执行 05_seed_demo_users.sql
--   2. 再执行本文件
--   3. 使用 ON CONFLICT (id) DO NOTHING，重复执行不会报错
--
-- 内容覆盖：
--   - 比赛类（8条）：挑战杯、蓝桥杯、电子设计、互联网+、数学建模美赛、英语辩论、机器人大赛、商业模拟
--   - 课设/毕设类（6条）：Java课设、单片机课设、数据库课设、毕设、前端课设、机械设计课设
--   - 项目/大创类（8条）：微信小程序、机器学习、物联网、校园二手、智能垃圾分类、在线教育、农产品电商、校园AR导航
--   - 学习搭子类（4条）：考研、考公、四六级、雅思口语
--   - 兴趣/社团类（4条）：摄影约拍、短视频创作、组乐队、羽毛球
--   - urgent = true 共 3 条（#1 挑战杯 / #5 美赛 / #16 机器学习项目）
--   - 发布时间均匀分布在现在到 5 天前
--   - 覆盖全部 16 个学院
--   - 20 个种子用户全部参与，优先使用未发过帖的用户
-- ============================================================

-- ============================================================
-- 比赛类（8条）
-- ============================================================

-- #01 [急] 挑战杯创业计划大赛找队友 — 陈思远 / 计算机科学学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '挑战杯创业计划大赛找队友已有2人再招1人',
    ARRAY['Python', '商业计划书', 'PPT'],
    '计算机科学学院',
    (SELECT user_id FROM profiles WHERE name = '陈思远'),
    true,
    now() - interval '4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #02 蓝桥杯算法竞赛冲省一 — 周明辉 / 电子与信息学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    '蓝桥杯算法竞赛一起刷题冲省一',
    ARRAY['C++', '算法', 'Python'],
    '电子与信息学院',
    (SELECT user_id FROM profiles WHERE name = '周明辉'),
    false,
    now() - interval '8 hours'
) ON CONFLICT (id) DO NOTHING;

-- #03 全国大学生电子设计竞赛组队 — 刘诗涵 / 自动化学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000003',
    '全国大学生电子设计竞赛组队缺硬件一人',
    ARRAY['嵌入式开发', 'PCB设计', '单片机'],
    '自动化学院',
    (SELECT user_id FROM profiles WHERE name = '刘诗涵'),
    false,
    now() - interval '16 hours'
) ON CONFLICT (id) DO NOTHING;

-- #04 互联网+创新创业大赛已有两人 — 郑宇轩 / 财经学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000004',
    '互联网+创新创业大赛已立项找技术合伙人',
    ARRAY['金融分析', '商业计划书', 'React'],
    '财经学院',
    (SELECT user_id FROM profiles WHERE name = '郑宇轩'),
    false,
    now() - interval '12 hours'
) ON CONFLICT (id) DO NOTHING;

-- #05 [急] 数学建模美赛MCM/ICM — 蔡明辉 / 数学与系统科学学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000005',
    '急招数学建模美赛队友会LaTeX优先',
    ARRAY['MATLAB', 'LaTeX', '数据分析'],
    '数学与系统科学学院',
    (SELECT user_id FROM profiles WHERE name = '蔡明辉'),
    true,
    now() - interval '4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #06 英语辩论赛FLTRP找搭档 — 何雨晴 / 外国语学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000006',
    '外研社英语辩论赛找搭档一起备赛',
    ARRAY['英语', '辩论', '演讲'],
    '外国语学院',
    (SELECT user_id FROM profiles WHERE name = '何雨晴'),
    false,
    now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

-- #07 RoboMaster机器人大赛招机械与电控 — 黄伟杰 / 机电学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000007',
    'RoboMaster机甲大师赛招机械和电控队友',
    ARRAY['机器人工程', 'Python', 'CAD'],
    '机电学院',
    (SELECT user_id FROM profiles WHERE name = '黄伟杰'),
    false,
    now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;

-- #08 尖峰时刻商业模拟大赛 — 杨俊杰 / 管理学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000008',
    '尖峰时刻商业模拟大赛找财务方向队友',
    ARRAY['数据分析', '商业计划书', 'PPT'],
    '管理学院',
    (SELECT user_id FROM profiles WHERE name = '杨俊杰'),
    false,
    now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 课设/毕设类（6条）
-- ============================================================

-- #09 Java Web课设找队友一起肝 — 林晓雨 / 计算机科学学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000009',
    'Java Web课设学生管理系统找队友一起肝',
    ARRAY['Java', 'Spring Boot', 'MySQL'],
    '计算机科学学院',
    (SELECT user_id FROM profiles WHERE name = '林晓雨'),
    false,
    now() - interval '20 hours'
) ON CONFLICT (id) DO NOTHING;

-- #10 单片机课设基于STM32温控系统 — 赵敏 / 机电学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000010',
    '单片机课设STM32温控系统缺上位机开发',
    ARRAY['C语言', '单片机', '传感器'],
    '机电学院',
    (SELECT user_id FROM profiles WHERE name = '赵敏'),
    false,
    now() - interval '3 days'
) ON CONFLICT (id) DO NOTHING;

-- #11 数据库课设图书管理系统 — 曾晓婷 / 光电工程学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000011',
    '数据库课设图书管理系统找前端配合',
    ARRAY['MySQL', 'ER图', 'SQL'],
    '光电工程学院',
    (SELECT user_id FROM profiles WHERE name = '曾晓婷'),
    false,
    now() - interval '1 day 4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #12 毕设基于深度学习的图像识别 — 陈思远 / 计算机科学学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000012',
    '毕业设计深度学习图像识别方向找队友讨论',
    ARRAY['Python', '机器学习', 'TensorFlow'],
    '计算机科学学院',
    (SELECT user_id FROM profiles WHERE name = '陈思远'),
    false,
    now() - interval '3 days'
) ON CONFLICT (id) DO NOTHING;

-- #13 前端课设Vue3 + Element Plus商城 — 沈佳琪 / 美术学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000013',
    '前端课设Vue3商城项目找后端配合联调',
    ARRAY['Vue', 'UI设计', 'Figma'],
    '美术学院',
    (SELECT user_id FROM profiles WHERE name = '沈佳琪'),
    false,
    now() - interval '1 day 8 hours'
) ON CONFLICT (id) DO NOTHING;

-- #14 机械设计课设减速器CAD出图 — 赵敏 / 机电学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000014',
    '机械设计课设二级减速器求SolidWorks大神带',
    ARRAY['机械设计', 'CAD', 'SolidWorks'],
    '机电学院',
    (SELECT user_id FROM profiles WHERE name = '赵敏'),
    false,
    now() - interval '4 days'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 项目/大创类（8条）
-- ============================================================

-- #15 微信小程序校园服务开发 — 唐昊天 / 文学与传媒学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000015',
    '微信小程序校园服务类项目找前后端队友',
    ARRAY['JavaScript', '云开发', 'UI设计'],
    '文学与传媒学院',
    (SELECT user_id FROM profiles WHERE name = '唐昊天'),
    false,
    now() - interval '1 day 12 hours'
) ON CONFLICT (id) DO NOTHING;

-- #16 [急] 机器学习项目医疗影像方向 — 周明辉 / 电子与信息学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000016',
    '急招机器学习医疗影像项目队友有GPU优先',
    ARRAY['Python', '机器学习', '计算机视觉'],
    '电子与信息学院',
    (SELECT user_id FROM profiles WHERE name = '周明辉'),
    true,
    now() - interval '20 hours'
) ON CONFLICT (id) DO NOTHING;

-- #17 物联网智能家居监控系统 — 刘诗涵 / 自动化学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000017',
    '大创项目智能家居监控系统找物联网方向队友',
    ARRAY['物联网', '嵌入式开发', 'PLC'],
    '自动化学院',
    (SELECT user_id FROM profiles WHERE name = '刘诗涵'),
    false,
    now() - interval '2 days 4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #18 校园二手交易小程序 — 郭俊良 / 网络空间安全学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000018',
    '校园二手交易小程序项目找全栈队友',
    ARRAY['React', 'Node.js', 'MySQL'],
    '网络空间安全学院',
    (SELECT user_id FROM profiles WHERE name = '郭俊良'),
    false,
    now() - interval '1 day 16 hours'
) ON CONFLICT (id) DO NOTHING;

-- #19 智能垃圾分类识别系统 — 曾晓婷 / 光电工程学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000019',
    '智能垃圾分类图像识别系统找算法队友',
    ARRAY['Python', '计算机视觉', '嵌入式开发'],
    '光电工程学院',
    (SELECT user_id FROM profiles WHERE name = '曾晓婷'),
    false,
    now() - interval '2 days 8 hours'
) ON CONFLICT (id) DO NOTHING;

-- #20 在线教育互动平台大创 — 徐若兰 / 教育科学学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000020',
    '大创在线教育互动平台找全栈开发队友',
    ARRAY['React', 'Python', '教育技术'],
    '教育科学学院',
    (SELECT user_id FROM profiles WHERE name = '徐若兰'),
    false,
    now() - interval '2 days 12 hours'
) ON CONFLICT (id) DO NOTHING;

-- #21 农产品电商助农兴农项目 — 杨俊杰 / 管理学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000021',
    '大创农产品电商助农项目找运营和前端',
    ARRAY['电商运营', '短视频', 'PS'],
    '管理学院',
    (SELECT user_id FROM profiles WHERE name = '杨俊杰'),
    false,
    now() - interval '2 days 16 hours'
) ON CONFLICT (id) DO NOTHING;

-- #22 校园导航AR地图App — 吴嘉豪 / 汽车与交通工程学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000022',
    '校园AR实景导航App项目找Unity开发',
    ARRAY['Unity', 'C#', 'AR'],
    '汽车与交通工程学院',
    (SELECT user_id FROM profiles WHERE name = '吴嘉豪'),
    false,
    now() - interval '2 days 20 hours'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 学习搭子类（4条）
-- ============================================================

-- #23 26考研找搭子互相监督 — 梁俊熙 / 法学与知识产权学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000023',
    '26法硕考研找搭子互相监督图书馆打卡',
    ARRAY['英语', '法律检索', '写作'],
    '法学与知识产权学院',
    (SELECT user_id FROM profiles WHERE name = '梁俊熙'),
    false,
    now() - interval '3 days 4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #24 考公刷题小组每日打卡 — 郑宇轩 / 财经学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000024',
    '考公刷题小组每日打卡互相批改申论',
    ARRAY['行测', '申论', 'Excel'],
    '财经学院',
    (SELECT user_id FROM profiles WHERE name = '郑宇轩'),
    false,
    now() - interval '3 days 8 hours'
) ON CONFLICT (id) DO NOTHING;

-- #25 四六级冲刺刷真题搭子 — 孙怡宁 / 财经学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000025',
    '四六级最后冲刺找搭子刷真题互相纠错',
    ARRAY['英语', '听力', '写作'],
    '财经学院',
    (SELECT user_id FROM profiles WHERE name = '孙怡宁'),
    false,
    now() - interval '3 days 12 hours'
) ON CONFLICT (id) DO NOTHING;

-- #26 雅思口语练习每周两次 — 马晓雯 / 管理学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000026',
    '雅思口语Part2对练每周两次目标6.5',
    ARRAY['英语', '口语', '听力'],
    '管理学院',
    (SELECT user_id FROM profiles WHERE name = '马晓雯'),
    false,
    now() - interval '3 days 16 hours'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 兴趣/社团类（4条）
-- ============================================================

-- #27 校园约拍互勉写真 — 沈佳琪 / 美术学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000027',
    '校园约拍互免写真日系清新风找摄影搭子',
    ARRAY['人像摄影', 'PS', 'LR'],
    '美术学院',
    (SELECT user_id FROM profiles WHERE name = '沈佳琪'),
    false,
    now() - interval '3 days 20 hours'
) ON CONFLICT (id) DO NOTHING;

-- #28 短视频创作抖音/B站小团队 — 唐昊天 / 文学与传媒学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000028',
    '短视频创作小组找拍摄剪辑和出镜伙伴',
    ARRAY['PR', '文案', '摄影'],
    '文学与传媒学院',
    (SELECT user_id FROM profiles WHERE name = '唐昊天'),
    false,
    now() - interval '4 days 4 hours'
) ON CONFLICT (id) DO NOTHING;

-- #29 乐队招贝斯手和鼓手 — 冯悦 / 音乐学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000029',
    '校园乐队招贝斯手和鼓手风格流行摇滚',
    ARRAY['MIDI编曲', '贝斯', '架子鼓'],
    '音乐学院',
    (SELECT user_id FROM profiles WHERE name = '冯悦'),
    false,
    now() - interval '4 days 8 hours'
) ON CONFLICT (id) DO NOTHING;

-- #30 羽毛球约球每周二四六 — 梁俊熙 / 法学与知识产权学院
INSERT INTO recruitments (id, title, skills, college, author_id, urgent, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000030',
    '羽毛球约球每周二四六下午体育馆求组队',
    ARRAY['羽毛球', '体能训练', '运动康复'],
    '法学与知识产权学院',
    (SELECT user_id FROM profiles WHERE name = '梁俊熙'),
    false,
    now() - interval '4 days 12 hours'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 验证 SQL（可选，执行完后运行以检查数据）
-- ============================================================
-- 统计招募帖总数（期望 >= 30）
-- SELECT count(*) AS recruitment_count FROM recruitments;
--
-- 按发布者统计招募帖数
-- SELECT p.name, p.college, count(r.id) AS post_count
-- FROM profiles p
-- LEFT JOIN recruitments r ON r.author_id = p.user_id
-- WHERE p.name IN (
--   '陈思远','林晓雨','黄伟杰','赵敏','周明辉','刘诗涵','吴嘉豪',
--   '孙怡宁','郑宇轩','马晓雯','杨俊杰','何雨晴','唐昊天',
--   '徐若兰','郭俊良','沈佳琪','蔡明辉','曾晓婷','梁俊熙','冯悦'
-- )
-- GROUP BY p.name, p.college
-- ORDER BY post_count DESC;
--
-- 按学院统计
-- SELECT college, count(*) AS cnt
-- FROM recruitments
-- GROUP BY college
-- ORDER BY cnt DESC;
--
-- urgent 统计
-- SELECT urgent, count(*) FROM recruitments GROUP BY urgent;
