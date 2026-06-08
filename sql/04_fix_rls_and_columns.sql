-- ============================================================
-- 修复 SQL：Issue #2 + #3 + #36
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- ============================================================
-- Issue #2: project_members 缺 INSERT/UPDATE/DELETE RLS 策略
-- ============================================================

-- 允许项目创建者添加成员（createProject 时使用）
DROP POLICY IF EXISTS "项目创建者可添加成员" ON project_members;
CREATE POLICY "项目创建者可添加成员"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND created_by = auth.uid()
    )
  );

-- 允许用户将自己加入项目（被邀请加入）
DROP POLICY IF EXISTS "用户可加入项目" ON project_members;
CREATE POLICY "用户可加入项目"
  ON project_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许项目创建者移除成员
DROP POLICY IF EXISTS "项目创建者可移除成员" ON project_members;
CREATE POLICY "项目创建者可移除成员"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND created_by = auth.uid()
    )
  );

-- 允许项目创建者更新成员角色
DROP POLICY IF EXISTS "项目创建者可更新成员角色" ON project_members;
CREATE POLICY "项目创建者可更新成员角色"
  ON project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND created_by = auth.uid()
    )
  );

-- ============================================================
-- Issue #17: matches 表添加 DELETE 策略（删除对话）
-- ============================================================
DROP POLICY IF EXISTS "双方可删除匹配" ON matches;
CREATE POLICY "双方可删除匹配" ON matches FOR DELETE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- ============================================================
-- Issue #3: profiles 表补 wechat/role 列（若缺失）
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wechat'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wechat TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- ============================================================
-- Issue #16: 消息时间跨天区分（添加格式化函数，可选）
-- 使用 to_char 在 SQL 层支持日期格式化
-- ============================================================

-- 创建格式化函数（供前端使用，SQL 层辅助）
CREATE OR REPLACE FUNCTION format_message_time(sent_at TIMESTAMPTZ)
RETURNS TEXT AS $$
DECLARE
  diff_days INTEGER;
BEGIN
  diff_days := EXTRACT(DAY FROM (now() - sent_at));
  IF diff_days = 0 THEN
    RETURN to_char(sent_at, 'HH24:MI');
  ELSIF diff_days = 1 THEN
    RETURN '昨天 ' || to_char(sent_at, 'HH24:MI');
  ELSIF diff_days < 7 THEN
    RETURN to_char(sent_at, '周Dy') || ' ' || to_char(sent_at, 'HH24:MI');
  ELSE
    RETURN to_char(sent_at, 'MM-DD HH24:MI');
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- profiles RLS: 确保所有人可读（修复可能漏掉的策略）
-- ============================================================

-- 检查并补 profiles 公开读取策略
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = '所有人可读档案'
  ) THEN
    CREATE POLICY "所有人可读档案" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================
-- profiles RLS: 管理员可删招募帖（补确认）
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'recruitments' AND policyname = '管理员可删除任何招募'
  ) THEN
    CREATE POLICY "管理员可删除任何招募"
      ON recruitments FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
