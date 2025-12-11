-- Insert sample venues (San Francisco area)
INSERT INTO public.venues (name, latitude, longitude, icon_url, landing_url) VALUES
  ('Golden Gate Bridge', 37.8199, -122.4783, '/icons/bridge.svg', 'https://example.com/golden-gate'),
  ('Alcatraz Island', 37.8267, -122.4230, '/icons/alcatraz.svg', 'https://example.com/alcatraz'),
  ('Ferry Building', 37.7852, -122.3948, '/icons/ferry.svg', 'https://example.com/ferry-building'),
  ('Twin Peaks', 37.7514, -122.4481, '/icons/peak.svg', 'https://example.com/twin-peaks'),
  ('Palace of Fine Arts', 37.8014, -122.4476, '/icons/palace.svg', 'https://example.com/palace')
ON CONFLICT DO NOTHING;
