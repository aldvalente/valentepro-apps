-- Seed test data for development and testing
-- This migration adds sample users and equipment

-- Insert test users
INSERT INTO "users" ("id", "name", "email", "emailVerified", "image", "passwordHash", "role", "createdAt", "updatedAt")
VALUES 
  ('test-user-1', 'Mario Rossi', 'mario.rossi@example.com', NULL, NULL, '$2a$10$c7cJaXFg2wfj5aI/Hyf4TODmEO1R/twPQFTeTsIEC10QHZz1x4wAS', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-user-2', 'Giulia Bianchi', 'giulia.bianchi@example.com', NULL, NULL, '$2a$10$9SceNctzgjamBvEY2NP1Eer.WlpwYFXBWxhcrrzXzYEtSllUO.sbC', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-admin-1', 'Admin Gearbnb', 'admin@gearbnb.com', NULL, NULL, '$2a$10$VcrfT6DVgjwZtCIpcdBEv.nMjtR5rSbPn0FhykDBYMeNRoiu5QsCK', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Insert test equipment (sports gear)
INSERT INTO "equipment" ("id", "title", "description", "sportType", "dailyPrice", "locationAddress", "latitude", "longitude", "images", "isActive", "ownerId", "createdAt", "updatedAt")
VALUES 
  -- Skiing equipment
  ('test-equip-1', 'Sci Rossignol Experience 88', 'Set completo di sci all-mountain Rossignol Experience 88, perfetti per piste e fuoripista. Include attacchi e bastoncini. Ideali per sciatori intermedi e avanzati.', 'skiing', 35.00, 'Via Marconi 15, Cortina d''Ampezzo, BL, Italia', 46.5402, 12.1357, ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'], true, 'test-user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  ('test-equip-2', 'Snowboard Burton Custom', 'Tavola da snowboard Burton Custom all-mountain, misura 158cm. Perfetta per ogni tipo di terreno e condizione di neve. Include attacchi Burton.', 'snowboarding', 40.00, 'Piazza San Marco 1, Livigno, SO, Italia', 46.5349, 10.1348, ARRAY['https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800'], true, 'test-user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Cycling equipment
  ('test-equip-3', 'Mountain Bike Trek X-Caliber', 'Mountain bike Trek X-Caliber 29", full suspension, 21 velocità. Perfetta per trail e percorsi off-road. Include casco e lucchetto.', 'cycling', 25.00, 'Via Roma 45, Trento, TN, Italia', 46.0664, 11.1257, ARRAY['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'], true, 'test-user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  ('test-equip-4', 'Bici da Corsa Bianchi Oltre', 'Bici da corsa professionale Bianchi Oltre XR4, telaio in carbonio. Ideale per ciclisti esperti su strada. Peso 7.2kg.', 'cycling', 50.00, 'Corso Vittorio Emanuele 78, Milano, MI, Italia', 45.4642, 9.1900, ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'], true, 'test-user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Water sports
  ('test-equip-5', 'Tavola da Surf 7''6"', 'Tavola da surf funboard 7''6", ideale per principianti e intermedi. Include leash e sacca da trasporto.', 'surfing', 30.00, 'Viale Nazario Sauro 12, Forte dei Marmi, LU, Italia', 43.9604, 10.1728, ARRAY['https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800'], true, 'test-user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  ('test-equip-6', 'Kayak da Mare Wilderness Systems', 'Kayak da mare biposto Wilderness Systems Tarpon 135T. Include pagaie, giubbotti salvagente e teli paraspruzzi.', 'kayaking', 45.00, 'Lungomare Cristoforo Colombo 234, La Spezia, SP, Italia', 44.1024, 9.8249, ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'], true, 'test-user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Tennis
  ('test-equip-7', 'Racchetta da Tennis Wilson Pro Staff', 'Racchetta da tennis Wilson Pro Staff RF97, peso 340g. Include borsa porta racchette. Ideale per giocatori intermedi e avanzati.', 'tennis', 20.00, 'Via dello Sport 89, Roma, RM, Italia', 41.9028, 12.4964, ARRAY['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800'], true, 'test-user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Hiking/Camping
  ('test-equip-8', 'Kit Completo da Trekking', 'Kit completo da trekking: zaino 65L North Face, tenda 2 posti, sacco a pelo 4 stagioni, materassino gonfiabile, fornello da campeggio.', 'hiking', 35.00, 'Via Nazionale 156, Bolzano, BZ, Italia', 46.4983, 11.3548, ARRAY['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'], true, 'test-user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Climbing
  ('test-equip-9', 'Set Arrampicata Completo', 'Set completo per arrampicata sportiva: corda 70m, 12 rinvii, imbrago, casco Petzl, discensore e moschettoni.', 'climbing', 40.00, 'Via Monte Bianco 23, Arco, TN, Italia', 45.9189, 10.8858, ARRAY['https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800'], true, 'test-user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Diving
  ('test-equip-10', 'Attrezzatura Subacquea Completa', 'Set completo per immersioni: muta 5mm, erogatore, GAV, computer subacqueo, maschera e pinne. Ideale per brevetto Open Water e superiori.', 'diving', 60.00, 'Viale Regina Margherita 45, Taormina, ME, Italia', 37.8519, 15.2885, ARRAY['https://images.unsplash.com/photo-1544551763-92fee7e50e0e?w=800'], true, 'test-user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert some test reviews
INSERT INTO "reviews" ("id", "equipmentId", "userId", "rating", "comment", "createdAt", "updatedAt")
VALUES 
  ('test-review-1', 'test-equip-1', 'test-user-2', 5, 'Sci fantastici! Perfetti per la neve fresca, molto stabili e facili da controllare. Il proprietario è stato molto disponibile.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-review-2', 'test-equip-3', 'test-user-1', 4, 'Ottima mountain bike, ben tenuta. Perfetta per i sentieri intorno al lago. Consigliata!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-review-3', 'test-equip-5', 'test-user-2', 5, 'Tavola perfetta per imparare! Ho passato una giornata fantastica. Noleggio super consigliato.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-review-4', 'test-equip-7', 'test-admin-1', 4, 'Racchetta professionale, ottimo grip e controllo. Ideale per tornei amatoriali.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert some test bookings
INSERT INTO "bookings" ("id", "userId", "equipmentId", "startDate", "endDate", "totalPrice", "status", "createdAt", "updatedAt")
VALUES 
  ('test-booking-1', 'test-user-2', 'test-equip-1', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '10 days', 105.00, 'CONFIRMED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-booking-2', 'test-user-1', 'test-equip-6', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '5 days', 90.00, 'REQUESTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('test-booking-3', 'test-admin-1', 'test-equip-4', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 100.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
