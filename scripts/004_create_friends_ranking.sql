ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS friend_code VARCHAR(8) UNIQUE;

-- Crear funcion para generar codigo unico
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

UPDATE profiles 
SET friend_code = generate_friend_code() 
WHERE friend_code IS NULL;

-- Crear trigger para asignar codigo automaticamente a nuevos usuarios
CREATE OR REPLACE FUNCTION assign_friend_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.friend_code IS NULL THEN
    NEW.friend_code := generate_friend_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_friend_code ON profiles;
CREATE TRIGGER trigger_assign_friend_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_friend_code();

-- Tabla de amistades
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW weekly_rankings AS
SELECT 
  p.id,
  p.name as full_name,
  p.friend_code,
  COALESCE(SUM(a.emissions), 0) as weekly_emissions,
  COUNT(a.id) as activity_count,
  RANK() OVER (ORDER BY COALESCE(SUM(a.emissions), 0) ASC) as rank
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id 
  AND a.created_at >= date_trunc('week', CURRENT_TIMESTAMP)
  AND a.created_at < date_trunc('week', CURRENT_TIMESTAMP) + INTERVAL '1 week'
GROUP BY p.id, p.name, p.friend_code;

GRANT SELECT ON weekly_rankings TO authenticated;
