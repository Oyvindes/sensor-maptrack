-- Script to add sample products to the database
-- Run this in the Supabase SQL Editor after setting up the tables

-- Insert sample products
INSERT INTO products (
  id, 
  name, 
  description, 
  price, 
  image_url, 
  created_at, 
  created_by, 
  updated_at
)
VALUES 
  (
    gen_random_uuid(), 
    'Temperature Sensor', 
    'High precision temperature sensor with WiFi connectivity. Range: -40°C to 125°C with ±0.1°C accuracy.', 
    299.99, 
    'https://images.unsplash.com/photo-1621274147744-cfb5032bb7a0?q=80&w=500&auto=format&fit=crop', 
    NOW(), 
    'System Admin', 
    NULL
  ),
  (
    gen_random_uuid(), 
    'Humidity Sensor', 
    'Advanced humidity sensor with real-time monitoring capabilities. Accuracy: ±2% RH with fast response time.', 
    249.99, 
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500&auto=format&fit=crop', 
    NOW(), 
    'System Admin', 
    NULL
  ),
  (
    gen_random_uuid(), 
    'Water Leak Detector', 
    'Early warning water leak detection system with remote alerts. Includes 3 detection cables and wireless hub.', 
    399.99, 
    'https://images.unsplash.com/photo-1584949514490-73fc1a2faa97?q=80&w=500&auto=format&fit=crop', 
    NOW(), 
    'System Admin', 
    NULL
  ),
  (
    gen_random_uuid(), 
    'Air Quality Monitor', 
    'Comprehensive air quality monitoring system that detects VOCs, PM2.5, CO2, and more. Includes smartphone app.', 
    349.99, 
    'https://images.unsplash.com/photo-1527689638836-411945a2b57c?q=80&w=500&auto=format&fit=crop', 
    NOW(), 
    'System Admin', 
    NULL
  ),
  (
    gen_random_uuid(), 
    'Motion Sensor', 
    'Wireless motion detection sensor with adjustable sensitivity and 120° field of view. Battery life: up to 2 years.', 
    199.99, 
    'https://images.unsplash.com/photo-1585314062604-1a357de8b000?q=80&w=500&auto=format&fit=crop', 
    NOW(), 
    'System Admin', 
    NULL
  );

-- Verify the products were added
SELECT id, name, price FROM products ORDER BY created_at DESC LIMIT 10;