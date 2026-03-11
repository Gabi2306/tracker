-- =============================================
-- SCRIPT DE DATOS DE PRUEBA
-- Ejecutar DESPUES de los scripts 001-004
-- =============================================

-- Primero, crear los usuarios de prueba en auth.users
-- NOTA: Esto debe hacerse manualmente desde Supabase Dashboard > Authentication
-- o los usuarios deben registrarse normalmente.
-- Este script asume que los usuarios ya existen.

-- Insertar perfiles de prueba (si no existen)
-- Los friend_codes se generan automaticamente por el trigger
INSERT INTO profiles (id, name, email, friend_code, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Carlos García', 'ejemplo1@gmail.com', 'CARL1234', NOW() - INTERVAL '14 days'),
  ('22222222-2222-2222-2222-222222222222', 'María López', 'ejemplo2@gmail.com', 'MARI5678', NOW() - INTERVAL '14 days'),
  ('33333333-3333-3333-3333-333333333333', 'Juan Rodríguez', 'ejemplo3@gmail.com', 'JUAN9ABC', NOW() - INTERVAL '14 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  friend_code = EXCLUDED.friend_code;

-- Hacer que los 3 usuarios sean amigos entre sí
INSERT INTO friendships (user_id, friend_id, status, created_at)
VALUES
  -- Carlos y María son amigos
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'accepted', NOW() - INTERVAL '10 days'),
  -- Carlos y Juan son amigos
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted', NOW() - INTERVAL '8 days'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'accepted', NOW() - INTERVAL '8 days'),
  -- María y Juan son amigos
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'accepted', NOW() - INTERVAL '5 days'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- =============================================
-- ACTIVIDADES DE LA SEMANA PASADA
-- =============================================

-- Carlos García - Semana pasada (emisiones moderadas)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Hamburguesa con papas', 'food', 3.2, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'Viaje en auto al trabajo', 'transport', 2.5, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 'Pollo asado', 'food', 1.8, NOW() - INTERVAL '9 days'),
('11111111-1111-1111-1111-111111111111', 'Viaje en bus', 'transport', 0.3, NOW() - INTERVAL '9 days'),
('11111111-1111-1111-1111-111111111111', 'Pizza familiar', 'food', 2.1, NOW() - INTERVAL '8 days'),
('11111111-1111-1111-1111-111111111111', 'Uber al centro', 'transport', 1.8, NOW() - INTERVAL '8 days');

-- María López - Semana pasada (bajas emisiones - muy ecológica)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Ensalada vegana', 'food', 0.4, NOW() - INTERVAL '10 days'),
('22222222-2222-2222-2222-222222222222', 'Bicicleta al trabajo', 'transport', 0.0, NOW() - INTERVAL '10 days'),
('22222222-2222-2222-2222-222222222222', 'Pasta con verduras', 'food', 0.6, NOW() - INTERVAL '9 days'),
('22222222-2222-2222-2222-222222222222', 'Caminata', 'transport', 0.0, NOW() - INTERVAL '9 days'),
('22222222-2222-2222-2222-222222222222', 'Sopa de lentejas', 'food', 0.3, NOW() - INTERVAL '8 days'),
('22222222-2222-2222-2222-222222222222', 'Metro', 'transport', 0.1, NOW() - INTERVAL '8 days');

-- Juan Rodríguez - Semana pasada (altas emisiones)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Carne asada BBQ', 'food', 5.2, NOW() - INTERVAL '10 days'),
('33333333-3333-3333-3333-333333333333', 'Viaje en avión corto', 'transport', 15.0, NOW() - INTERVAL '10 days'),
('33333333-3333-3333-3333-333333333333', 'Costillas de cerdo', 'food', 3.8, NOW() - INTERVAL '9 days'),
('33333333-3333-3333-3333-333333333333', 'Taxi aeropuerto', 'transport', 4.2, NOW() - INTERVAL '9 days'),
('33333333-3333-3333-3333-333333333333', 'Filete de res', 'food', 6.1, NOW() - INTERVAL '8 days'),
('33333333-3333-3333-3333-333333333333', 'Auto particular', 'transport', 3.5, NOW() - INTERVAL '8 days');

-- =============================================
-- ACTIVIDADES DE ESTA SEMANA
-- =============================================

-- Carlos García - Esta semana (mejorando)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Tacos de pollo', 'food', 1.2, NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'Metro al trabajo', 'transport', 0.2, NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'Sandwich de atún', 'food', 0.8, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'Bicicleta', 'transport', 0.0, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'Arroz con frijoles', 'food', 0.5, NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'Caminar', 'transport', 0.0, NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'Café con leche', 'food', 0.3, NOW()),
('11111111-1111-1111-1111-111111111111', 'Bus eléctrico', 'transport', 0.1, NOW());

-- María López - Esta semana (sigue siendo ecológica)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Bowl de quinoa', 'food', 0.3, NOW() - INTERVAL '3 days'),
('22222222-2222-2222-2222-222222222222', 'Scooter eléctrico', 'transport', 0.05, NOW() - INTERVAL '3 days'),
('22222222-2222-2222-2222-222222222222', 'Wrap vegetariano', 'food', 0.4, NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'Bicicleta', 'transport', 0.0, NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'Smoothie de frutas', 'food', 0.2, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'Caminata', 'transport', 0.0, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'Avena con frutas', 'food', 0.15, NOW()),
('22222222-2222-2222-2222-222222222222', 'Metro', 'transport', 0.1, NOW());

-- Juan Rodríguez - Esta semana (intentando mejorar pero aún alto)
INSERT INTO activities (user_id, name, category, emissions, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Pollo frito', 'food', 2.1, NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'Auto al trabajo', 'transport', 2.8, NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'Hamburguesa doble', 'food', 4.5, NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'Uber', 'transport', 1.5, NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'Sushi (con atún)', 'food', 1.8, NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'Bus', 'transport', 0.3, NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'Hot dog', 'food', 1.2, NOW()),
('33333333-3333-3333-3333-333333333333', 'Taxi', 'transport', 1.9, NOW());

-- =============================================
-- RESUMEN ESPERADO DEL RANKING SEMANAL:
-- 1. María López: ~1.2 kg CO2 (la más ecológica)
-- 2. Carlos García: ~3.1 kg CO2 (mejorando)
-- 3. Juan Rodríguez: ~16.1 kg CO2 (necesita mejorar)
-- =============================================
