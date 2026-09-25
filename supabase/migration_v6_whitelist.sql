-- Migration v6: Whitelist feature
ALTER TABLE topics ADD COLUMN IF NOT EXISTS whitelist_enabled BOOLEAN DEFAULT false;
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS is_whitelisted BOOLEAN DEFAULT false;
