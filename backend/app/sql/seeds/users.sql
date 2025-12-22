-- =============================================================================
-- SCRIPT D'INITIALISATION DES UTILISATEURS FACTICES
-- Pour tester le système de classement
-- =============================================================================

INSERT INTO "user" (user_id, username, mail, victories, defeats, created_at) VALUES

-- =============================================================================
-- TOP JOUEURS (Rang 1-20) - Très actifs, bon ratio
-- =============================================================================
('usr-001-aaaa-bbbb-cccc', 'DragonSlayer', 'dragon.slayer@test.com', 487, 89, '2024-01-15 10:30:00+00'),
('usr-002-aaaa-bbbb-cccc', 'NinjaWord', 'ninja.word@test.com', 456, 102, '2024-01-20 14:45:00+00'),
('usr-003-aaaa-bbbb-cccc', 'PixelHunter', 'pixel.hunter@test.com', 423, 98, '2024-02-01 09:15:00+00'),
('usr-004-aaaa-bbbb-cccc', 'StarGazer', 'star.gazer@test.com', 398, 115, '2024-02-10 16:20:00+00'),
('usr-005-aaaa-bbbb-cccc', 'ThunderBolt', 'thunder.bolt@test.com', 385, 95, '2024-02-14 11:00:00+00'),
('usr-006-aaaa-bbbb-cccc', 'ShadowMaster', 'shadow.master@test.com', 372, 128, '2024-02-20 08:30:00+00'),
('usr-007-aaaa-bbbb-cccc', 'CyberWolf', 'cyber.wolf@test.com', 358, 110, '2024-03-01 13:45:00+00'),
('usr-008-aaaa-bbbb-cccc', 'PhoenixRise', 'phoenix.rise@test.com', 345, 132, '2024-03-05 17:00:00+00'),
('usr-009-aaaa-bbbb-cccc', 'IceQueen', 'ice.queen@test.com', 334, 98, '2024-03-10 10:15:00+00'),
('usr-010-aaaa-bbbb-cccc', 'BlazeFury', 'blaze.fury@test.com', 321, 145, '2024-03-15 15:30:00+00'),
('usr-011-aaaa-bbbb-cccc', 'MysticSage', 'mystic.sage@test.com', 312, 108, '2024-03-20 09:45:00+00'),
('usr-012-aaaa-bbbb-cccc', 'VortexKing', 'vortex.king@test.com', 298, 122, '2024-03-25 14:00:00+00'),
('usr-013-aaaa-bbbb-cccc', 'LunarEclipse', 'lunar.eclipse@test.com', 287, 95, '2024-04-01 11:30:00+00'),
('usr-014-aaaa-bbbb-cccc', 'SolarFlare', 'solar.flare@test.com', 276, 134, '2024-04-05 16:45:00+00'),
('usr-015-aaaa-bbbb-cccc', 'NeonRacer', 'neon.racer@test.com', 265, 112, '2024-04-10 08:00:00+00'),
('usr-016-aaaa-bbbb-cccc', 'CrimsonBlade', 'crimson.blade@test.com', 254, 98, '2024-04-15 13:15:00+00'),
('usr-017-aaaa-bbbb-cccc', 'AquaMarine', 'aqua.marine@test.com', 248, 142, '2024-04-20 10:30:00+00'),
('usr-018-aaaa-bbbb-cccc', 'StormChaser', 'storm.chaser@test.com', 239, 105, '2024-04-25 15:45:00+00'),
('usr-019-aaaa-bbbb-cccc', 'GhostRider', 'ghost.rider@test.com', 231, 118, '2024-05-01 09:00:00+00'),
('usr-020-aaaa-bbbb-cccc', 'TitanForce', 'titan.force@test.com', 225, 132, '2024-05-05 14:15:00+00'),

-- =============================================================================
-- JOUEURS INTERMEDIAIRES (Rang 21-50) - Actifs, ratio moyen
-- =============================================================================
('usr-021-aaaa-bbbb-cccc', 'CosmicDust', 'cosmic.dust@test.com', 218, 145, '2024-05-10 11:30:00+00'),
('usr-022-aaaa-bbbb-cccc', 'EmeraldKnight', 'emerald.knight@test.com', 212, 128, '2024-05-15 16:45:00+00'),
('usr-023-aaaa-bbbb-cccc', 'RubyHeart', 'ruby.heart@test.com', 205, 152, '2024-05-20 08:00:00+00'),
('usr-024-aaaa-bbbb-cccc', 'SapphireSky', 'sapphire.sky@test.com', 198, 138, '2024-05-25 13:15:00+00'),
('usr-025-aaaa-bbbb-cccc', 'OnyxShadow', 'onyx.shadow@test.com', 192, 165, '2024-06-01 10:30:00+00'),
('usr-026-aaaa-bbbb-cccc', 'JadeWarrior', 'jade.warrior@test.com', 187, 142, '2024-06-05 15:45:00+00'),
('usr-027-aaaa-bbbb-cccc', 'TopazTiger', 'topaz.tiger@test.com', 181, 158, '2024-06-10 09:00:00+00'),
('usr-028-aaaa-bbbb-cccc', 'AmberWitch', 'amber.witch@test.com', 176, 134, '2024-06-15 14:15:00+00'),
('usr-029-aaaa-bbbb-cccc', 'PearlDiver', 'pearl.diver@test.com', 172, 148, '2024-06-20 11:30:00+00'),
('usr-030-aaaa-bbbb-cccc', 'DiamondEdge', 'diamond.edge@test.com', 168, 162, '2024-06-25 16:45:00+00'),
('usr-031-aaaa-bbbb-cccc', 'BronzeBeast', 'bronze.beast@test.com', 163, 145, '2024-07-01 08:00:00+00'),
('usr-032-aaaa-bbbb-cccc', 'SilverArrow', 'silver.arrow@test.com', 158, 138, '2024-07-05 13:15:00+00'),
('usr-033-aaaa-bbbb-cccc', 'GoldenEagle', 'golden.eagle@test.com', 154, 152, '2024-07-10 10:30:00+00'),
('usr-034-aaaa-bbbb-cccc', 'PlatinumPro', 'platinum.pro@test.com', 149, 128, '2024-07-15 15:45:00+00'),
('usr-035-aaaa-bbbb-cccc', 'CopperClaw', 'copper.claw@test.com', 145, 165, '2024-07-20 09:00:00+00'),
('usr-036-aaaa-bbbb-cccc', 'IronWill', 'iron.will@test.com', 142, 142, '2024-07-25 14:15:00+00'),
('usr-037-aaaa-bbbb-cccc', 'SteelNerve', 'steel.nerve@test.com', 138, 158, '2024-08-01 11:30:00+00'),
('usr-038-aaaa-bbbb-cccc', 'ChromeHeart', 'chrome.heart@test.com', 134, 134, '2024-08-05 16:45:00+00'),
('usr-039-aaaa-bbbb-cccc', 'TitaniumSoul', 'titanium.soul@test.com', 131, 148, '2024-08-10 08:00:00+00'),
('usr-040-aaaa-bbbb-cccc', 'CarbonFiber', 'carbon.fiber@test.com', 128, 162, '2024-08-15 13:15:00+00'),
('usr-041-aaaa-bbbb-cccc', 'NitroBoost', 'nitro.boost@test.com', 125, 145, '2024-08-20 10:30:00+00'),
('usr-042-aaaa-bbbb-cccc', 'TurboCharge', 'turbo.charge@test.com', 122, 138, '2024-08-25 15:45:00+00'),
('usr-043-aaaa-bbbb-cccc', 'RocketFuel', 'rocket.fuel@test.com', 118, 152, '2024-09-01 09:00:00+00'),
('usr-044-aaaa-bbbb-cccc', 'PlasmaCore', 'plasma.core@test.com', 115, 128, '2024-09-05 14:15:00+00'),
('usr-045-aaaa-bbbb-cccc', 'LaserBeam', 'laser.beam@test.com', 112, 165, '2024-09-10 11:30:00+00'),
('usr-046-aaaa-bbbb-cccc', 'PhotonPulse', 'photon.pulse@test.com', 109, 142, '2024-09-15 16:45:00+00'),
('usr-047-aaaa-bbbb-cccc', 'QuantumLeap', 'quantum.leap@test.com', 106, 158, '2024-09-20 08:00:00+00'),
('usr-048-aaaa-bbbb-cccc', 'GravityWell', 'gravity.well@test.com', 103, 134, '2024-09-25 13:15:00+00'),
('usr-049-aaaa-bbbb-cccc', 'WarpDrive', 'warp.drive@test.com', 100, 148, '2024-10-01 10:30:00+00'),
('usr-050-aaaa-bbbb-cccc', 'HyperSpace', 'hyper.space@test.com', 98, 162, '2024-10-05 15:45:00+00'),

-- =============================================================================
-- JOUEURS REGULIERS (Rang 51-80) - Moins actifs
-- =============================================================================
('usr-051-aaaa-bbbb-cccc', 'NebulaRider', 'nebula.rider@test.com', 95, 78, '2024-10-10 09:00:00+00'),
('usr-052-aaaa-bbbb-cccc', 'CometTail', 'comet.tail@test.com', 92, 85, '2024-10-15 14:15:00+00'),
('usr-053-aaaa-bbbb-cccc', 'AsteroidMiner', 'asteroid.miner@test.com', 89, 92, '2024-10-20 11:30:00+00'),
('usr-054-aaaa-bbbb-cccc', 'MeteorShower', 'meteor.shower@test.com', 86, 78, '2024-10-25 16:45:00+00'),
('usr-055-aaaa-bbbb-cccc', 'SunSpot', 'sun.spot@test.com', 83, 95, '2024-11-01 08:00:00+00'),
('usr-056-aaaa-bbbb-cccc', 'MoonBeam', 'moon.beam@test.com', 81, 72, '2024-11-05 13:15:00+00'),
('usr-057-aaaa-bbbb-cccc', 'StarDust', 'star.dust@test.com', 78, 88, '2024-11-10 10:30:00+00'),
('usr-058-aaaa-bbbb-cccc', 'PlanetHopper', 'planet.hopper@test.com', 75, 82, '2024-11-15 15:45:00+00'),
('usr-059-aaaa-bbbb-cccc', 'GalaxyRunner', 'galaxy.runner@test.com', 73, 95, '2024-11-20 09:00:00+00'),
('usr-060-aaaa-bbbb-cccc', 'UniverseKing', 'universe.king@test.com', 71, 68, '2024-11-25 14:15:00+00'),
('usr-061-aaaa-bbbb-cccc', 'VoidWalker', 'void.walker@test.com', 68, 85, '2024-12-01 11:30:00+00'),
('usr-062-aaaa-bbbb-cccc', 'DarkMatter', 'dark.matter@test.com', 66, 92, '2024-12-05 16:45:00+00'),
('usr-063-aaaa-bbbb-cccc', 'BlackHole', 'black.hole@test.com', 64, 78, '2024-12-10 08:00:00+00'),
('usr-064-aaaa-bbbb-cccc', 'WhiteDwarf', 'white.dwarf@test.com', 62, 88, '2024-12-15 13:15:00+00'),
('usr-065-aaaa-bbbb-cccc', 'RedGiant', 'red.giant@test.com', 59, 72, '2025-01-01 10:30:00+00'),
('usr-066-aaaa-bbbb-cccc', 'BluePulsar', 'blue.pulsar@test.com', 57, 95, '2025-01-05 15:45:00+00'),
('usr-067-aaaa-bbbb-cccc', 'NeutronStar', 'neutron.star@test.com', 55, 82, '2025-01-10 09:00:00+00'),
('usr-068-aaaa-bbbb-cccc', 'Supernova', 'supernova@test.com', 53, 68, '2025-01-15 14:15:00+00'),
('usr-069-aaaa-bbbb-cccc', 'QuasarLight', 'quasar.light@test.com', 51, 88, '2025-01-20 11:30:00+00'),
('usr-070-aaaa-bbbb-cccc', 'MagnetarPower', 'magnetar.power@test.com', 49, 92, '2025-01-25 16:45:00+00'),
('usr-071-aaaa-bbbb-cccc', 'EventHorizon', 'event.horizon@test.com', 47, 78, '2025-02-01 08:00:00+00'),
('usr-072-aaaa-bbbb-cccc', 'SpaceTime', 'space.time@test.com', 45, 85, '2025-02-05 13:15:00+00'),
('usr-073-aaaa-bbbb-cccc', 'Singularity', 'singularity@test.com', 43, 72, '2025-02-10 10:30:00+00'),
('usr-074-aaaa-bbbb-cccc', 'Multiverse', 'multiverse@test.com', 42, 95, '2025-02-15 15:45:00+00'),
('usr-075-aaaa-bbbb-cccc', 'Dimension', 'dimension@test.com', 40, 68, '2025-02-20 09:00:00+00'),
('usr-076-aaaa-bbbb-cccc', 'Paradox', 'paradox@test.com', 38, 82, '2025-02-25 14:15:00+00'),
('usr-077-aaaa-bbbb-cccc', 'Anomaly', 'anomaly@test.com', 36, 88, '2025-03-01 11:30:00+00'),
('usr-078-aaaa-bbbb-cccc', 'Entropy', 'entropy@test.com', 35, 92, '2025-03-05 16:45:00+00'),
('usr-079-aaaa-bbbb-cccc', 'Infinity', 'infinity@test.com', 33, 78, '2025-03-10 08:00:00+00'),
('usr-080-aaaa-bbbb-cccc', 'Eternity', 'eternity@test.com', 31, 85, '2025-03-15 13:15:00+00'),

-- =============================================================================
-- NOUVEAUX JOUEURS (Rang 81-100) - Peu de parties
-- =============================================================================
('usr-081-aaaa-bbbb-cccc', 'FreshStart', 'fresh.start@test.com', 28, 32, '2025-03-20 10:30:00+00'),
('usr-082-aaaa-bbbb-cccc', 'NewPlayer', 'new.player@test.com', 25, 28, '2025-03-25 15:45:00+00'),
('usr-083-aaaa-bbbb-cccc', 'Rookie', 'rookie@test.com', 23, 35, '2025-04-01 09:00:00+00'),
('usr-084-aaaa-bbbb-cccc', 'Beginner', 'beginner@test.com', 21, 24, '2025-04-05 14:15:00+00'),
('usr-085-aaaa-bbbb-cccc', 'Starter', 'starter@test.com', 19, 31, '2025-04-10 11:30:00+00'),
('usr-086-aaaa-bbbb-cccc', 'Newcomer', 'newcomer@test.com', 17, 22, '2025-04-15 16:45:00+00'),
('usr-087-aaaa-bbbb-cccc', 'FirstTimer', 'first.timer@test.com', 15, 28, '2025-04-20 08:00:00+00'),
('usr-088-aaaa-bbbb-cccc', 'JustJoined', 'just.joined@test.com', 14, 18, '2025-04-25 13:15:00+00'),
('usr-089-aaaa-bbbb-cccc', 'GreenHorn', 'green.horn@test.com', 12, 25, '2025-05-01 10:30:00+00'),
('usr-090-aaaa-bbbb-cccc', 'Noob', 'noob@test.com', 10, 15, '2025-05-05 15:45:00+00'),
('usr-091-aaaa-bbbb-cccc', 'Apprentice', 'apprentice@test.com', 9, 21, '2025-05-10 09:00:00+00'),
('usr-092-aaaa-bbbb-cccc', 'Trainee', 'trainee@test.com', 8, 12, '2025-05-15 14:15:00+00'),
('usr-093-aaaa-bbbb-cccc', 'Newbie', 'newbie@test.com', 7, 18, '2025-05-20 11:30:00+00'),
('usr-094-aaaa-bbbb-cccc', 'Recruit', 'recruit@test.com', 6, 9, '2025-05-25 16:45:00+00'),
('usr-095-aaaa-bbbb-cccc', 'Cadet', 'cadet@test.com', 5, 14, '2025-06-01 08:00:00+00'),
('usr-096-aaaa-bbbb-cccc', 'Initiate', 'initiate@test.com', 4, 8, '2025-06-05 13:15:00+00'),
('usr-097-aaaa-bbbb-cccc', 'Novice', 'novice@test.com', 3, 11, '2025-06-10 10:30:00+00'),
('usr-098-aaaa-bbbb-cccc', 'Freshman', 'freshman@test.com', 2, 5, '2025-06-15 15:45:00+00'),
('usr-099-aaaa-bbbb-cccc', 'JustHere', 'just.here@test.com', 1, 3, '2025-06-20 09:00:00+00'),
('usr-100-aaaa-bbbb-cccc', 'Observer', 'observer@test.com', 0, 2, '2025-06-25 14:15:00+00'),

-- =============================================================================
-- JOUEURS SANS EMAIL (Guests convertis)
-- =============================================================================
('usr-101-aaaa-bbbb-cccc', 'SilentNinja', NULL, 156, 98, '2024-06-01 10:00:00+00'),
('usr-102-aaaa-bbbb-cccc', 'MysteryGamer', NULL, 134, 112, '2024-07-15 14:30:00+00'),
('usr-103-aaaa-bbbb-cccc', 'AnonymousHero', NULL, 98, 87, '2024-08-20 09:45:00+00'),
('usr-104-aaaa-bbbb-cccc', 'HiddenTalent', NULL, 76, 65, '2024-09-10 16:00:00+00'),
('usr-105-aaaa-bbbb-cccc', 'GhostPlayer', NULL, 54, 48, '2024-10-05 11:15:00+00'),
('usr-106-aaaa-bbbb-cccc', 'ShadowGuest', NULL, 42, 38, '2024-11-12 13:45:00+00'),
('usr-107-aaaa-bbbb-cccc', 'InvisibleOne', NULL, 28, 32, '2024-12-20 08:30:00+00'),
('usr-108-aaaa-bbbb-cccc', 'PhantomUser', NULL, 15, 22, '2025-01-08 15:00:00+00'),
('usr-109-aaaa-bbbb-cccc', 'SecretAgent', NULL, 8, 12, '2025-02-14 10:45:00+00'),
('usr-110-aaaa-bbbb-cccc', 'UnknownForce', NULL, 3, 7, '2025-03-22 14:00:00+00'),

-- =============================================================================
-- JOUEURS AVEC RATIOS EXTREMES (Pour tester l'affichage)
-- =============================================================================
('usr-111-aaaa-bbbb-cccc', 'PerfectScore', 'perfect.score@test.com', 50, 0, '2024-05-01 09:00:00+00'),
('usr-112-aaaa-bbbb-cccc', 'Undefeated', 'undefeated@test.com', 35, 0, '2024-06-15 14:00:00+00'),
('usr-113-aaaa-bbbb-cccc', 'AlwaysWins', 'always.wins@test.com', 22, 1, '2024-07-20 11:00:00+00'),
('usr-114-aaaa-bbbb-cccc', 'LuckyStreak', 'lucky.streak@test.com', 18, 2, '2024-08-25 16:00:00+00'),
('usr-115-aaaa-bbbb-cccc', 'BadLuck', 'bad.luck@test.com', 2, 45, '2024-09-30 08:00:00+00'),
('usr-116-aaaa-bbbb-cccc', 'Unlucky', 'unlucky@test.com', 5, 68, '2024-10-15 13:00:00+00'),
('usr-117-aaaa-bbbb-cccc', 'KeepTrying', 'keep.trying@test.com', 8, 82, '2024-11-20 10:00:00+00'),
('usr-118-aaaa-bbbb-cccc', 'NeverGiveUp', 'never.give.up@test.com', 12, 95, '2024-12-25 15:00:00+00'),
('usr-119-aaaa-bbbb-cccc', 'Balanced', 'balanced@test.com', 100, 100, '2025-01-10 09:00:00+00'),
('usr-120-aaaa-bbbb-cccc', 'FiftyFifty', 'fifty.fifty@test.com', 75, 75, '2025-02-15 14:00:00+00')

ON CONFLICT (user_id) DO NOTHING;