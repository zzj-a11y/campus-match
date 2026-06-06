-- ============================================================
-- 校园智搭 - 数据库建表 SQL
-- 在 Supabase SQL Editor 中一次性执行此文件
-- 分两阶段：先建所有表 → 再建 RLS 策略（避免循环依赖）
-- ============================================================

-- ============================================================
-- 阶段 1：建表 + 索引
-- ============================================================

-- 1. 用户档案表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  college TEXT,
  grade TEXT,
  skills TEXT[],
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);

-- 2. 匹配记录表
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'matched', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_a, user_b);

-- 3. 项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 项目成员表（先建好，后面 projects/tasks 的 RLS 会引用它）
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  UNIQUE(project_id, user_id)
);

-- 5. 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  assignee TEXT DEFAULT '未分配',
  due_date TEXT DEFAULT '待定',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, sent_at);

-- 7. 招募帖表
CREATE TABLE IF NOT EXISTS recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  skills TEXT[],
  college TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recruitments_skills ON recruitments USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_recruitments_college ON recruitments(college);

-- ============================================================
-- 阶段 2：RLS 策略（所有表已存在，可以安全交叉引用）
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可读自己的档案"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可创建自己的档案" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可更新自己的档案" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户可读自己的匹配"   ON matches FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "用户可创建匹配"       ON matches FOR INSERT WITH CHECK (auth.uid() = user_a);
CREATE POLICY "用户可更新自己的匹配" ON matches FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "项目成员可读"
  ON projects FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );
CREATE POLICY "认证用户可创建项目"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "成员可读"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects WHERE id = project_members.project_id AND created_by = auth.uid()
    )
  );

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "项目成员可读任务"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE id = tasks.project_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );
CREATE POLICY "项目成员可操作任务"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE id = tasks.project_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "匹配双方可读消息"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user_a = auth.uid() OR matches.user_b = auth.uid())
    )
  );
CREATE POLICY "认证用户可发消息"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- recruitments
ALTER TABLE recruitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "所有人可读招募帖"     ON recruitments FOR SELECT USING (true);
CREATE POLICY "认证用户可发布招募"   ON recruitments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "作者可删除自己的招募" ON recruitments FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- 开启 Realtime（用于即时通讯，可选）
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
