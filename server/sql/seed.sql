-- Seed initial owner admin
INSERT IGNORE INTO admins (email, password_hash, role, is_active)
VALUES ('twizerimanaolivier2008@gmail.com', '$2a$10$qre6O6bfibfsUxyv.WI.2.lmsEScd7qjO8KhKAEKQxwqbtvo4.nmG', 'owner', 1);
