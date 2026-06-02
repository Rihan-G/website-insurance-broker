-- Allow authenticated users to create their own profile row when the signup trigger
-- did not run (e.g. user created before migrations, or trigger race on first login).

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
