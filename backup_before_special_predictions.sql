SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict iujsR0e1gzVxrPb5FhMiC4T1eYRNofVKAnhgBgwxVb4qCSrpwPdUI1Zze8RbBDp

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'authenticated', 'authenticated', 'alvarezpablo360@gmail.com', '$2a$10$fIn./vWAhhxFDtgG2MUf2eXM1nibI9iAzFsMdAXNjE07TPh8mT5IW', '2026-06-23 12:51:51.919415+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 12:51:51.929859+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c2cd434b-c964-4093-acfa-924fae3e484e", "email": "alvarezpablo360@gmail.com", "display_name": "Alvion", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 12:51:51.883886+00', '2026-06-24 07:31:47.817804+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'authenticated', 'authenticated', 'rrjorge8@gmail.com', '$2a$10$2Ck00mXkmuXf8qhtXZgog.tM5pK6iYNBezNKhsOEYTsrAgf95haj.', '2026-06-22 08:49:55.681631+00', NULL, '', '2026-06-22 08:47:44.963738+00', '', NULL, '', '', NULL, '2026-06-23 14:14:40.219191+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "884abf92-c836-4e02-bbd1-e373cdaa55cd", "email": "rrjorge8@gmail.com", "display_name": "Pollo", "email_verified": true, "phone_verified": false}', NULL, '2026-06-22 08:47:44.911321+00', '2026-06-24 09:42:01.090255+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'authenticated', 'authenticated', 'anto.trinidad24@gmail.com', '$2a$10$dUgkMRaIY.Jhe0UX4r0oF.YMBQ/neqdyljl3czH3z6p0BnegC78AG', '2026-06-23 12:53:34.700119+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 22:50:16.254886+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "2f150ca7-1e04-4ea2-9654-51e07553a5c6", "email": "anto.trinidad24@gmail.com", "display_name": "Antonio", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 12:53:34.651837+00', '2026-06-24 09:16:01.720054+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', 'authenticated', 'authenticated', 'nacho.simo.garcia@gmail.com', '$2a$10$9nVOCrxJR6dV.uabi4oHc.ha0lha/r0U1FA5A5LhZ.oBtKm/7/Sy6', '2026-06-23 10:37:10.928922+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 15:13:03.123494+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d47244ae-6b64-4b0f-a9b9-1815a6328d01", "email": "nacho.simo.garcia@gmail.com", "display_name": "Nacho Simó", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 10:37:10.90811+00', '2026-06-24 07:33:02.02663+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8fa00e77-689b-4f66-b327-4600e7617d3e', 'authenticated', 'authenticated', 'evegaesteve@gmail.com', '$2a$10$exo8.0RRt4AhzuoCIOCi1ee1JNNCDRQ7BXdJ0kwtGIbTbTFdQTyQ.', '2026-06-23 12:57:24.697226+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 12:57:24.703062+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8fa00e77-689b-4f66-b327-4600e7617d3e", "email": "evegaesteve@gmail.com", "display_name": "Dudas", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 12:57:24.669504+00', '2026-06-23 16:17:35.953375+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'authenticated', 'authenticated', 'agustingonzalezpujana@gmail.com', '$2a$10$VccCbr6TlQrqoJL.BJEpp.Hh2zIOogX.8wUSpRa8P.CINYRNGrNUi', '2026-06-23 09:53:43.528264+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 09:53:43.540398+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7", "email": "agustingonzalezpujana@gmail.com", "display_name": "Agus", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 09:53:43.477436+00', '2026-06-24 08:44:04.672631+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'authenticated', 'authenticated', 'migueldspscl@gmail.com', '$2a$10$BtSE6Q3yTaaLbAATZ69dFOydN1Z/gU0eQQwxHsm36Cy.Xc4B2kZ2K', '2026-06-23 16:25:28.782241+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 16:25:28.790051+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "59432c84-2a2e-4362-8dc9-c4ee8c1611fa", "email": "migueldspscl@gmail.com", "display_name": "Miguel", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 16:25:28.756314+00', '2026-06-24 06:19:45.149335+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0930660b-5514-44f7-8b77-0729bc2966c6', 'authenticated', 'authenticated', 'nachocordoba20@gmail.com', '$2a$10$ee8kw4SiM9lS14AdOAgmxexTiklYWlJ7KCuWeVtYo4vKHUQPJZYpC', '2026-06-23 16:15:06.59555+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 16:15:06.605348+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "0930660b-5514-44f7-8b77-0729bc2966c6", "email": "nachocordoba20@gmail.com", "display_name": "Cordoba", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 16:15:06.540657+00', '2026-06-24 08:55:22.48951+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b30f1245-7316-4181-88c5-d2912822ed78', 'authenticated', 'authenticated', 'bofilln@gmail.com', '$2a$10$uk/ba7EmG6Ea93adhT/KzeB3AEaJi4c/DZIA.VoS2n8g9ArEm.Tsy', '2026-06-23 09:41:02.723929+00', NULL, '', '2026-06-23 09:40:41.995799+00', '', NULL, '', '', NULL, '2026-06-23 09:41:19.859409+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b30f1245-7316-4181-88c5-d2912822ed78", "email": "bofilln@gmail.com", "display_name": "BofasALLIN", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 09:40:41.951828+00', '2026-06-24 09:38:01.819904+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'authenticated', 'authenticated', 'jaime.llamazares02@gmail.com', '$2a$10$eot2goJAq64rM9/SbxjC9.HtosvJ26eXT7c31UEutv5usB56L1qWG', '2026-06-23 10:24:09.063117+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-24 08:32:49.947361+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "2daf29b4-112f-4832-be08-8e3c08d3fc91", "email": "jaime.llamazares02@gmail.com", "display_name": "Jaime4", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 10:24:09.023552+00', '2026-06-24 08:32:49.980228+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'authenticated', 'authenticated', 'gonarroyoar@gmail.com', '$2a$10$suV3j8rQtxLW8PjJcOB03OIGI3XitrH/MDBEiUVMzdx2zqw0C7wAC', '2026-06-23 09:54:36.204841+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 09:54:36.211219+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f1edf59f-f325-48b6-a1ea-8c62e30cf4ad", "email": "gonarroyoar@gmail.com", "display_name": "Arroyo", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 09:54:36.182495+00', '2026-06-24 08:34:28.64449+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'authenticated', 'authenticated', 'sete.bdm.1010@gmail.com', '$2a$10$LDxyJnrZIp5vBSLkuNYzYOWNi7keLUuwRKSAkOL504WfPpRhoMOPi', '2026-06-23 09:51:16.416099+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-23 09:51:16.421653+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "fd7ba2b0-fcc4-4753-95f8-24ffd76db33d", "email": "sete.bdm.1010@gmail.com", "display_name": "Fonsilátero", "email_verified": true, "phone_verified": false}', NULL, '2026-06-23 09:51:16.398485+00', '2026-06-24 10:07:45.373943+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('884abf92-c836-4e02-bbd1-e373cdaa55cd', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '{"sub": "884abf92-c836-4e02-bbd1-e373cdaa55cd", "email": "rrjorge8@gmail.com", "display_name": "Pollo", "email_verified": true, "phone_verified": false}', 'email', '2026-06-22 08:47:44.950992+00', '2026-06-22 08:47:44.951061+00', '2026-06-22 08:47:44.951061+00', '5798e648-9ff0-4449-bad2-6a2c30f50fb5'),
	('2f150ca7-1e04-4ea2-9654-51e07553a5c6', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '{"sub": "2f150ca7-1e04-4ea2-9654-51e07553a5c6", "email": "anto.trinidad24@gmail.com", "display_name": "Antonio", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 12:53:34.69375+00', '2026-06-23 12:53:34.693809+00', '2026-06-23 12:53:34.693809+00', 'f5f248f4-acb0-4676-bcd3-05c1fc58032a'),
	('8fa00e77-689b-4f66-b327-4600e7617d3e', '8fa00e77-689b-4f66-b327-4600e7617d3e', '{"sub": "8fa00e77-689b-4f66-b327-4600e7617d3e", "email": "evegaesteve@gmail.com", "display_name": "Dudas", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 12:57:24.69046+00', '2026-06-23 12:57:24.690528+00', '2026-06-23 12:57:24.690528+00', 'd05ed9c4-dd68-42cf-91b2-1d0d8b88b7be'),
	('b30f1245-7316-4181-88c5-d2912822ed78', 'b30f1245-7316-4181-88c5-d2912822ed78', '{"sub": "b30f1245-7316-4181-88c5-d2912822ed78", "email": "bofilln@gmail.com", "display_name": "BofasALLIN", "email_verified": true, "phone_verified": false}', 'email', '2026-06-23 09:40:41.988227+00', '2026-06-23 09:40:41.988277+00', '2026-06-23 09:40:41.988277+00', 'd8ac1440-1da0-401d-8af9-a2c48caabf1c'),
	('fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '{"sub": "fd7ba2b0-fcc4-4753-95f8-24ffd76db33d", "email": "sete.bdm.1010@gmail.com", "display_name": "Fonsilátero", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 09:51:16.412521+00', '2026-06-23 09:51:16.412568+00', '2026-06-23 09:51:16.412568+00', 'e94bfb32-a921-43d0-90c1-788bc5e7cc02'),
	('4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '{"sub": "4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7", "email": "agustingonzalezpujana@gmail.com", "display_name": "Agus", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 09:53:43.523385+00', '2026-06-23 09:53:43.52343+00', '2026-06-23 09:53:43.52343+00', 'c6da9bbc-c533-41dc-a86a-c8a3fa9924b7'),
	('f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '{"sub": "f1edf59f-f325-48b6-a1ea-8c62e30cf4ad", "email": "gonarroyoar@gmail.com", "display_name": "Arroyo", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 09:54:36.20089+00', '2026-06-23 09:54:36.200964+00', '2026-06-23 09:54:36.200964+00', 'aac0d590-207d-43dc-89d6-9965357681a3'),
	('2daf29b4-112f-4832-be08-8e3c08d3fc91', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '{"sub": "2daf29b4-112f-4832-be08-8e3c08d3fc91", "email": "jaime.llamazares02@gmail.com", "display_name": "Jaime4", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 10:24:09.058229+00', '2026-06-23 10:24:09.058309+00', '2026-06-23 10:24:09.058309+00', 'ed515a10-92ea-4d5a-a006-e926888c4074'),
	('d47244ae-6b64-4b0f-a9b9-1815a6328d01', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', '{"sub": "d47244ae-6b64-4b0f-a9b9-1815a6328d01", "email": "nacho.simo.garcia@gmail.com", "display_name": "Nacho Simó", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 10:37:10.922242+00', '2026-06-23 10:37:10.922289+00', '2026-06-23 10:37:10.922289+00', '78d8ebbe-ff67-4592-8462-9674612ee5a9'),
	('c2cd434b-c964-4093-acfa-924fae3e484e', 'c2cd434b-c964-4093-acfa-924fae3e484e', '{"sub": "c2cd434b-c964-4093-acfa-924fae3e484e", "email": "alvarezpablo360@gmail.com", "display_name": "Alvion", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 12:51:51.909644+00', '2026-06-23 12:51:51.909696+00', '2026-06-23 12:51:51.909696+00', 'fdb2c9e8-14b4-4e55-b6e6-751993acbf97'),
	('0930660b-5514-44f7-8b77-0729bc2966c6', '0930660b-5514-44f7-8b77-0729bc2966c6', '{"sub": "0930660b-5514-44f7-8b77-0729bc2966c6", "email": "nachocordoba20@gmail.com", "display_name": "Cordoba", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 16:15:06.589812+00', '2026-06-23 16:15:06.589862+00', '2026-06-23 16:15:06.589862+00', '9b7fda69-87cd-42ae-9fb5-ef5041acefad'),
	('59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '{"sub": "59432c84-2a2e-4362-8dc9-c4ee8c1611fa", "email": "migueldspscl@gmail.com", "display_name": "Miguel", "email_verified": false, "phone_verified": false}', 'email', '2026-06-23 16:25:28.778188+00', '2026-06-23 16:25:28.77824+00', '2026-06-23 16:25:28.77824+00', '23abda9e-84d5-4c26-bc07-d85dfc61fee6');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('2bb9c89b-eb71-450b-b610-57a5816722f8', 'b30f1245-7316-4181-88c5-d2912822ed78', '2026-06-23 09:41:02.729584+00', '2026-06-23 09:41:02.729584+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '83.33.230.120', NULL, NULL, NULL, NULL, NULL),
	('bc9b04d1-92eb-4f85-945b-b2accb20bd91', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '2026-06-23 16:25:28.791195+00', '2026-06-24 06:19:45.15529+00', NULL, 'aal1', NULL, '2026-06-24 06:19:45.15519', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '178.139.172.42', NULL, NULL, NULL, NULL, NULL),
	('6366f1c9-1a49-4267-9fef-a8cdf462c779', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-23 10:24:09.075331+00', '2026-06-23 10:24:09.075331+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '95.124.172.93', NULL, NULL, NULL, NULL, NULL),
	('7eabb3ff-eb76-44db-91b3-7287c6aa88a4', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-23 15:20:25.012686+00', '2026-06-23 15:20:25.012686+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '95.124.172.93', NULL, NULL, NULL, NULL, NULL),
	('016d3c08-4829-419e-a380-91833276e546', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-23 10:44:02.408385+00', '2026-06-23 10:44:02.408385+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '95.124.172.93', NULL, NULL, NULL, NULL, NULL),
	('bef21614-6d55-4605-b744-306c273d17f6', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', '2026-06-23 10:37:10.935151+00', '2026-06-24 07:33:02.033521+00', NULL, 'aal1', NULL, '2026-06-24 07:33:02.033419', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '47.62.160.131', NULL, NULL, NULL, NULL, NULL),
	('34e82342-7a82-4ab4-bfa8-dd62e5af6689', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '2026-06-23 09:51:16.422637+00', '2026-06-24 10:07:45.381659+00', NULL, 'aal1', NULL, '2026-06-24 10:07:45.381557', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1', '46.222.194.185', NULL, NULL, NULL, NULL, NULL),
	('632b3807-3baa-4509-991e-7bc1b4358b5c', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '2026-06-23 22:50:16.256825+00', '2026-06-24 09:16:01.7305+00', NULL, 'aal1', NULL, '2026-06-24 09:16:01.730352', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '81.34.55.154', NULL, NULL, NULL, NULL, NULL),
	('6986c5a1-017d-40a2-8839-770d5949a1d2', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-23 17:45:07.55725+00', '2026-06-23 17:45:07.55725+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '95.124.172.93', NULL, NULL, NULL, NULL, NULL),
	('94351ad5-d6d4-4d28-bbd1-7375ed045baa', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-24 08:32:49.949191+00', '2026-06-24 08:32:49.949191+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '80.29.195.67', NULL, NULL, NULL, NULL, NULL),
	('bb9c1eb0-af01-44d1-ad50-39ccc6b32b10', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 08:57:48.874719+00', '2026-06-23 08:57:48.874719+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15', '138.4.238.163', NULL, NULL, NULL, NULL, NULL),
	('5d04a483-2b6a-4047-b7ef-a9abbaac9ff7', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 13:19:29.858556+00', '2026-06-23 13:19:29.858556+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15', '81.44.103.191', NULL, NULL, NULL, NULL, NULL),
	('827d7673-ee83-428b-a273-35c57becd52a', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '2026-06-23 09:54:36.211419+00', '2026-06-24 08:34:28.652453+00', NULL, 'aal1', NULL, '2026-06-24 08:34:28.65234', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7.2 Mobile/15E148 Safari/604.1', '64.226.180.158', NULL, NULL, NULL, NULL, NULL),
	('d77a4a64-68f8-4166-8eed-ca723e8be8db', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '2026-06-23 09:53:43.541472+00', '2026-06-24 08:44:04.685537+00', NULL, 'aal1', NULL, '2026-06-24 08:44:04.68543', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Mobile/15E148 Safari/604.1', '81.44.85.185', NULL, NULL, NULL, NULL, NULL),
	('01678be1-660c-4235-9a1f-de66b7959a11', '8fa00e77-689b-4f66-b327-4600e7617d3e', '2026-06-23 12:57:24.704415+00', '2026-06-23 16:17:35.955398+00', NULL, 'aal1', NULL, '2026-06-23 16:17:35.955286', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '130.225.165.50', NULL, NULL, NULL, NULL, NULL),
	('4d0e2ba2-1046-4e43-bab7-205061c61403', '0930660b-5514-44f7-8b77-0729bc2966c6', '2026-06-23 16:15:06.606498+00', '2026-06-24 08:55:22.501934+00', NULL, 'aal1', NULL, '2026-06-24 08:55:22.50176', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '95.124.147.96', NULL, NULL, NULL, NULL, NULL),
	('123686fa-f263-46a7-83ba-15f43ce96afc', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', '2026-06-23 15:13:03.124748+00', '2026-06-24 06:06:43.64234+00', NULL, 'aal1', NULL, '2026-06-24 06:06:43.642214', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1', '178.139.227.161', NULL, NULL, NULL, NULL, NULL),
	('0d56692f-fe83-4ac5-a5d2-52cc7fe055f5', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '2026-06-24 07:09:21.623282+00', '2026-06-24 07:09:21.623282+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', '80.29.195.67', NULL, NULL, NULL, NULL, NULL),
	('dda5ec73-8f94-4269-a881-40917a05162a', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 13:20:21.61857+00', '2026-06-24 09:09:18.366105+00', NULL, 'aal1', NULL, '2026-06-24 09:09:18.366004', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15', '138.4.224.215', NULL, NULL, NULL, NULL, NULL),
	('4bb419b6-dc6f-42e9-9c1e-d39154e37aad', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 09:14:10.147499+00', '2026-06-24 07:25:00.856883+00', NULL, 'aal1', NULL, '2026-06-24 07:25:00.856792', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15', '138.4.224.215', NULL, NULL, NULL, NULL, NULL),
	('4506af32-e7be-4343-8275-0cd08ededd5e', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 14:14:40.219405+00', '2026-06-24 09:28:37.662759+00', NULL, 'aal1', NULL, '2026-06-24 09:28:37.662668', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '138.4.224.215', NULL, NULL, NULL, NULL, NULL),
	('a763e9c2-fa41-49cf-b7e5-aa286586732c', 'b30f1245-7316-4181-88c5-d2912822ed78', '2026-06-23 09:41:19.859508+00', '2026-06-24 09:38:01.827487+00', NULL, 'aal1', NULL, '2026-06-24 09:38:01.827385', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '37.10.233.5', NULL, NULL, NULL, NULL, NULL),
	('75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '2026-06-23 08:56:18.606191+00', '2026-06-24 09:42:01.099705+00', NULL, 'aal1', NULL, '2026-06-24 09:42:01.099595', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', '138.4.218.5', NULL, NULL, NULL, NULL, NULL),
	('7bfed050-b405-46f3-a0d2-49433358490a', 'c2cd434b-c964-4093-acfa-924fae3e484e', '2026-06-23 12:51:51.929989+00', '2026-06-24 07:31:47.842401+00', NULL, 'aal1', NULL, '2026-06-24 07:31:47.842285', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/149.0.7827.137 Mobile/15E148 Safari/604.1', '193.152.114.124', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8', '2026-06-23 08:56:18.622499+00', '2026-06-23 08:56:18.622499+00', 'password', '7ccaf86a-c7ec-4623-91ea-452a23d66204'),
	('bb9c1eb0-af01-44d1-ad50-39ccc6b32b10', '2026-06-23 08:57:48.88347+00', '2026-06-23 08:57:48.88347+00', 'password', 'f9417771-84e0-4ad8-9470-447d882fc636'),
	('4bb419b6-dc6f-42e9-9c1e-d39154e37aad', '2026-06-23 09:14:10.178969+00', '2026-06-23 09:14:10.178969+00', 'password', '1c128197-12ad-4e85-9d85-a589da23cdae'),
	('2bb9c89b-eb71-450b-b610-57a5816722f8', '2026-06-23 09:41:02.746126+00', '2026-06-23 09:41:02.746126+00', 'otp', '523d6590-9217-4533-9029-0cf03a99ae54'),
	('a763e9c2-fa41-49cf-b7e5-aa286586732c', '2026-06-23 09:41:19.861945+00', '2026-06-23 09:41:19.861945+00', 'password', '9ea9f09a-0548-49a5-8db6-6de4c7d371ad'),
	('34e82342-7a82-4ab4-bfa8-dd62e5af6689', '2026-06-23 09:51:16.426864+00', '2026-06-23 09:51:16.426864+00', 'password', 'accd88a1-06ba-4ab1-b5af-3ce29694b114'),
	('d77a4a64-68f8-4166-8eed-ca723e8be8db', '2026-06-23 09:53:43.549778+00', '2026-06-23 09:53:43.549778+00', 'password', '427462a2-d204-4ac8-a5f0-7fbc26869d9e'),
	('827d7673-ee83-428b-a273-35c57becd52a', '2026-06-23 09:54:36.216984+00', '2026-06-23 09:54:36.216984+00', 'password', '4be5a85c-4466-463d-b15b-5918e3863fe0'),
	('6366f1c9-1a49-4267-9fef-a8cdf462c779', '2026-06-23 10:24:09.086782+00', '2026-06-23 10:24:09.086782+00', 'password', 'c5a40cb8-b30a-4ad2-a65a-5e061f41248a'),
	('bef21614-6d55-4605-b744-306c273d17f6', '2026-06-23 10:37:10.943906+00', '2026-06-23 10:37:10.943906+00', 'password', 'ae4334ba-d8f6-437d-b414-bb665fb076a4'),
	('016d3c08-4829-419e-a380-91833276e546', '2026-06-23 10:44:02.43565+00', '2026-06-23 10:44:02.43565+00', 'password', '0c15da06-d2b0-4292-ad69-6611c1cdab99'),
	('7bfed050-b405-46f3-a0d2-49433358490a', '2026-06-23 12:51:51.941867+00', '2026-06-23 12:51:51.941867+00', 'password', '7612ecac-bf85-44de-944a-7b903faefb31'),
	('01678be1-660c-4235-9a1f-de66b7959a11', '2026-06-23 12:57:24.710576+00', '2026-06-23 12:57:24.710576+00', 'password', '320f0ee0-8497-4b02-b9ab-3e5e5dc6914b'),
	('5d04a483-2b6a-4047-b7ef-a9abbaac9ff7', '2026-06-23 13:19:29.882032+00', '2026-06-23 13:19:29.882032+00', 'password', '50935630-c916-4fad-84c0-2556b2c4397e'),
	('dda5ec73-8f94-4269-a881-40917a05162a', '2026-06-23 13:20:21.659441+00', '2026-06-23 13:20:21.659441+00', 'password', 'b932fafb-be75-46e0-9dd2-c6f8d631b6c0'),
	('4506af32-e7be-4343-8275-0cd08ededd5e', '2026-06-23 14:14:40.275161+00', '2026-06-23 14:14:40.275161+00', 'password', '54fff05b-e657-4eb7-81cd-59cc289c8a53'),
	('123686fa-f263-46a7-83ba-15f43ce96afc', '2026-06-23 15:13:03.183756+00', '2026-06-23 15:13:03.183756+00', 'password', 'd667c9db-c223-4c2f-befe-64b13a7193ff'),
	('7eabb3ff-eb76-44db-91b3-7287c6aa88a4', '2026-06-23 15:20:25.036452+00', '2026-06-23 15:20:25.036452+00', 'password', '3cbd42e4-5af9-408b-887d-cc8374a81d21'),
	('4d0e2ba2-1046-4e43-bab7-205061c61403', '2026-06-23 16:15:06.617912+00', '2026-06-23 16:15:06.617912+00', 'password', '65f2e616-31a7-4a3f-b600-ebe60379dbcb'),
	('bc9b04d1-92eb-4f85-945b-b2accb20bd91', '2026-06-23 16:25:28.796008+00', '2026-06-23 16:25:28.796008+00', 'password', 'ca1198ff-b165-42ad-a8b6-85b7088b137a'),
	('6986c5a1-017d-40a2-8839-770d5949a1d2', '2026-06-23 17:45:07.577345+00', '2026-06-23 17:45:07.577345+00', 'password', '463e5214-e103-4d11-a57e-e81f07ddb9e8'),
	('632b3807-3baa-4509-991e-7bc1b4358b5c', '2026-06-23 22:50:16.296308+00', '2026-06-23 22:50:16.296308+00', 'password', 'ddf101c0-0bb7-4751-ab4b-7eddbbb6c270'),
	('0d56692f-fe83-4ac5-a5d2-52cc7fe055f5', '2026-06-24 07:09:21.649715+00', '2026-06-24 07:09:21.649715+00', 'password', 'e4113ce2-7ea7-4fa6-8a71-f3c0fcd8d37a'),
	('94351ad5-d6d4-4d28-bbd1-7375ed045baa', '2026-06-24 08:32:49.991119+00', '2026-06-24 08:32:49.991119+00', 'password', '44716ffc-4120-4d34-8bda-6aaf3ff49401');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 56, 'rlveoxwgtf6v', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 15:55:41.387404+00', '2026-06-23 17:11:30.412479+00', '3wpjqofnl3q7', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 53, 'bjymohy25vla', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', true, '2026-06-23 15:13:03.145859+00', '2026-06-23 17:37:06.418679+00', NULL, '123686fa-f263-46a7-83ba-15f43ce96afc'),
	('00000000-0000-0000-0000-000000000000', 68, 'pggd2nsndivj', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-23 17:45:07.570733+00', '2026-06-23 17:45:07.570733+00', NULL, '6986c5a1-017d-40a2-8839-770d5949a1d2'),
	('00000000-0000-0000-0000-000000000000', 65, 'uh2m5syrturo', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 17:09:35.3655+00', '2026-06-23 18:08:04.004717+00', 'hvpewnpx6efe', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 59, 'k4njzvciqthd', '0930660b-5514-44f7-8b77-0729bc2966c6', true, '2026-06-23 16:15:06.615107+00', '2026-06-23 18:08:43.063236+00', NULL, '4d0e2ba2-1046-4e43-bab7-205061c61403'),
	('00000000-0000-0000-0000-000000000000', 64, 'djapp3o35ni7', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 17:05:13.04869+00', '2026-06-23 18:09:31.963882+00', 'h7txulebonvp', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 66, '24sc32dnxsyb', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 17:11:30.418549+00', '2026-06-23 18:09:46.513619+00', 'rlveoxwgtf6v', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 46, 'm3uxj3gqb2cg', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 13:16:11.980727+00', '2026-06-23 18:19:51.062429+00', 'njuj4kcexfsx', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 60, 'xjyg3mnnelbg', 'c2cd434b-c964-4093-acfa-924fae3e484e', true, '2026-06-23 16:17:12.224016+00', '2026-06-23 18:20:28.058541+00', 'tv7gvchtmthp', '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 40, 'x3sxf2gjlzbp', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', true, '2026-06-23 12:04:58.539574+00', '2026-06-23 18:31:01.40972+00', 'iqdaqxojv23y', 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 39, 'rlcqb3ikqjcq', 'b30f1245-7316-4181-88c5-d2912822ed78', true, '2026-06-23 11:46:59.583774+00', '2026-06-23 18:33:51.363923+00', 'emh32h4lmdcd', 'a763e9c2-fa41-49cf-b7e5-aa286586732c'),
	('00000000-0000-0000-0000-000000000000', 29, 'e2icrwii3etx', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', true, '2026-06-23 09:51:16.424398+00', '2026-06-23 18:35:07.810541+00', NULL, '34e82342-7a82-4ab4-bfa8-dd62e5af6689'),
	('00000000-0000-0000-0000-000000000000', 67, 'rms2gpjidijy', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', true, '2026-06-23 17:37:06.43185+00', '2026-06-23 18:38:29.931683+00', 'bjymohy25vla', '123686fa-f263-46a7-83ba-15f43ce96afc'),
	('00000000-0000-0000-0000-000000000000', 70, 'r2xiv6mlynf6', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 18:08:04.020326+00', '2026-06-23 19:06:29.571119+00', 'uh2m5syrturo', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 62, 'ty5hisk3pjvq', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', true, '2026-06-23 16:25:28.793553+00', '2026-06-23 19:07:36.048569+00', NULL, 'bc9b04d1-92eb-4f85-945b-b2accb20bd91'),
	('00000000-0000-0000-0000-000000000000', 73, 'mzoexdlec7f2', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 18:09:46.514016+00', '2026-06-23 19:07:57.391771+00', '24sc32dnxsyb', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 63, 'cf5edm5s6kr6', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 17:02:54.754446+00', '2026-06-23 19:08:57.437868+00', '2igg7zhgxxhh', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 72, 'ovxluku7nbwl', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 18:09:31.964352+00', '2026-06-23 19:10:31.516474+00', 'djapp3o35ni7', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 74, 'fmxnvghspyfh', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 18:19:51.070801+00', '2026-06-23 19:48:28.709881+00', 'm3uxj3gqb2cg', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 71, 'mtm2ri6tyyzn', '0930660b-5514-44f7-8b77-0729bc2966c6', true, '2026-06-23 18:08:43.072641+00', '2026-06-23 21:46:49.324549+00', 'k4njzvciqthd', '4d0e2ba2-1046-4e43-bab7-205061c61403'),
	('00000000-0000-0000-0000-000000000000', 52, 'fzd6qonwwdnx', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', true, '2026-06-23 14:30:03.436884+00', '2026-06-24 07:33:02.019516+00', 'pvrjbbpceh54', 'bef21614-6d55-4605-b744-306c273d17f6'),
	('00000000-0000-0000-0000-000000000000', 24, 'qk67y7cn3imb', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-23 08:57:48.880279+00', '2026-06-23 08:57:48.880279+00', NULL, 'bb9c1eb0-af01-44d1-ad50-39ccc6b32b10'),
	('00000000-0000-0000-0000-000000000000', 27, 'gbnre77ardtc', 'b30f1245-7316-4181-88c5-d2912822ed78', false, '2026-06-23 09:41:02.732274+00', '2026-06-23 09:41:02.732274+00', NULL, '2bb9c89b-eb71-450b-b610-57a5816722f8'),
	('00000000-0000-0000-0000-000000000000', 25, 'h37vncmmmn5o', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 09:14:10.164986+00', '2026-06-23 10:12:15.450557+00', NULL, '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 33, 'k4gzopcak4dm', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-23 10:24:09.083486+00', '2026-06-23 10:24:09.083486+00', NULL, '6366f1c9-1a49-4267-9fef-a8cdf462c779'),
	('00000000-0000-0000-0000-000000000000', 28, 'uvtyq33cle4u', 'b30f1245-7316-4181-88c5-d2912822ed78', true, '2026-06-23 09:41:19.860569+00', '2026-06-23 10:41:30.742518+00', NULL, 'a763e9c2-fa41-49cf-b7e5-aa286586732c'),
	('00000000-0000-0000-0000-000000000000', 36, '3pfefo2dx5nf', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-23 10:44:02.4301+00', '2026-06-23 10:44:02.4301+00', NULL, '016d3c08-4829-419e-a380-91833276e546'),
	('00000000-0000-0000-0000-000000000000', 31, '4gjywz4droby', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 09:54:36.214778+00', '2026-06-23 10:57:53.438028+00', NULL, '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 32, 'nvbtl3mnebhb', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 10:12:15.461723+00', '2026-06-23 11:17:50.325153+00', 'h37vncmmmn5o', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 35, 'emh32h4lmdcd', 'b30f1245-7316-4181-88c5-d2912822ed78', true, '2026-06-23 10:41:30.751425+00', '2026-06-23 11:46:59.567647+00', 'uvtyq33cle4u', 'a763e9c2-fa41-49cf-b7e5-aa286586732c'),
	('00000000-0000-0000-0000-000000000000', 30, 'iqdaqxojv23y', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', true, '2026-06-23 09:53:43.54371+00', '2026-06-23 12:04:58.532133+00', NULL, 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 38, 'rphkvvdbb7oe', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 11:17:50.337636+00', '2026-06-23 12:38:27.294326+00', 'nvbtl3mnebhb', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 23, '52csrujokf7q', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 08:56:18.618548+00', '2026-06-23 12:47:16.849268+00', NULL, '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 37, 'njuj4kcexfsx', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 10:57:53.447081+00', '2026-06-23 13:16:11.973804+00', '4gjywz4droby', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 47, 'eutmmulcyvrx', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-23 13:19:29.873892+00', '2026-06-23 13:19:29.873892+00', NULL, '5d04a483-2b6a-4047-b7ef-a9abbaac9ff7'),
	('00000000-0000-0000-0000-000000000000', 48, '3zxfn5gydltv', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 13:20:21.651914+00', '2026-06-23 14:18:33.833484+00', NULL, 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 42, 'wwvwozsorc6w', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 12:47:16.856861+00', '2026-06-23 14:22:27.741383+00', '52csrujokf7q', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 34, 'pvrjbbpceh54', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', true, '2026-06-23 10:37:10.937437+00', '2026-06-23 14:30:03.431504+00', NULL, 'bef21614-6d55-4605-b744-306c273d17f6'),
	('00000000-0000-0000-0000-000000000000', 49, 't47evlnwdggo', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 14:14:40.246132+00', '2026-06-23 15:13:35.325353+00', NULL, '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 55, 'vdv2doanngdr', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-23 15:20:25.030537+00', '2026-06-23 15:20:25.030537+00', NULL, '7eabb3ff-eb76-44db-91b3-7287c6aa88a4'),
	('00000000-0000-0000-0000-000000000000', 41, '3wpjqofnl3q7', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 12:38:27.30317+00', '2026-06-23 15:55:41.372831+00', 'rphkvvdbb7oe', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 51, 'au3vjr7kyodh', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 14:22:27.752204+00', '2026-06-23 15:56:09.652687+00', 'wwvwozsorc6w', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 54, 'cxafgmygljgy', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 15:13:35.327108+00', '2026-06-23 16:11:35.443152+00', 't47evlnwdggo', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 43, 'tv7gvchtmthp', 'c2cd434b-c964-4093-acfa-924fae3e484e', true, '2026-06-23 12:51:51.936943+00', '2026-06-23 16:17:12.219113+00', NULL, '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 45, '3aq3qaeob2e4', '8fa00e77-689b-4f66-b327-4600e7617d3e', true, '2026-06-23 12:57:24.707607+00', '2026-06-23 16:17:35.951929+00', NULL, '01678be1-660c-4235-9a1f-de66b7959a11'),
	('00000000-0000-0000-0000-000000000000', 61, 't7aimd3ctfiw', '8fa00e77-689b-4f66-b327-4600e7617d3e', false, '2026-06-23 16:17:35.952356+00', '2026-06-23 16:17:35.952356+00', '3aq3qaeob2e4', '01678be1-660c-4235-9a1f-de66b7959a11'),
	('00000000-0000-0000-0000-000000000000', 57, '2igg7zhgxxhh', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 15:56:09.657792+00', '2026-06-23 17:02:54.736003+00', 'au3vjr7kyodh', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 50, 'h7txulebonvp', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 14:18:33.843399+00', '2026-06-23 17:05:13.038773+00', '3zxfn5gydltv', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 58, 'hvpewnpx6efe', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 16:11:35.452734+00', '2026-06-23 17:09:35.352441+00', 'cxafgmygljgy', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 81, 'l32724aahpa7', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 19:06:29.581714+00', '2026-06-23 20:05:46.851175+00', 'r2xiv6mlynf6', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 82, 'jlxrv3awoen4', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', true, '2026-06-23 19:07:36.048977+00', '2026-06-23 20:13:20.401858+00', 'ty5hisk3pjvq', 'bc9b04d1-92eb-4f85-945b-b2accb20bd91'),
	('00000000-0000-0000-0000-000000000000', 79, '2ua7wwoszdh5', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', true, '2026-06-23 18:38:29.940671+00', '2026-06-23 21:20:48.02275+00', 'rms2gpjidijy', '123686fa-f263-46a7-83ba-15f43ce96afc'),
	('00000000-0000-0000-0000-000000000000', 90, 'iuywi2jmmhwb', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', false, '2026-06-23 21:20:48.032595+00', '2026-06-23 21:20:48.032595+00', '2ua7wwoszdh5', '123686fa-f263-46a7-83ba-15f43ce96afc'),
	('00000000-0000-0000-0000-000000000000', 86, 'ijq5qmxw5ssm', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 19:48:28.721377+00', '2026-06-23 21:22:37.895424+00', 'fmxnvghspyfh', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 87, 'qboj5r6sxyyf', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 20:05:46.860408+00', '2026-06-23 21:23:04.847966+00', 'l32724aahpa7', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 88, 'i77uumqsajgr', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', true, '2026-06-23 20:13:20.409627+00', '2026-06-23 21:43:08.576356+00', 'jlxrv3awoen4', 'bc9b04d1-92eb-4f85-945b-b2accb20bd91'),
	('00000000-0000-0000-0000-000000000000', 84, '7flbv66cdbb2', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 19:08:57.441192+00', '2026-06-23 21:43:52.823368+00', 'cf5edm5s6kr6', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 75, 'jqu72tnkoijc', 'c2cd434b-c964-4093-acfa-924fae3e484e', true, '2026-06-23 18:20:28.069897+00', '2026-06-23 21:45:48.030076+00', 'xjyg3mnnelbg', '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 76, 'cmabay5yhpua', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', true, '2026-06-23 18:31:01.416758+00', '2026-06-23 21:45:54.056236+00', 'x3sxf2gjlzbp', 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 78, 'k34tojwu4yb7', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', true, '2026-06-23 18:35:07.822935+00', '2026-06-23 21:47:29.567037+00', 'e2icrwii3etx', '34e82342-7a82-4ab4-bfa8-dd62e5af6689'),
	('00000000-0000-0000-0000-000000000000', 94, 'z7xo4y6qxlz7', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 21:43:52.829838+00', '2026-06-24 00:13:15.154973+00', '7flbv66cdbb2', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 96, 'yl6hnstggqzy', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', true, '2026-06-23 21:45:54.056635+00', '2026-06-24 04:31:50.182363+00', 'cmabay5yhpua', 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 101, 'dudfv26wbth3', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 00:13:15.173812+00', '2026-06-24 05:33:19.791162+00', 'z7xo4y6qxlz7', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 95, 'xzozv5ybg4ca', 'c2cd434b-c964-4093-acfa-924fae3e484e', true, '2026-06-23 21:45:48.036239+00', '2026-06-24 05:49:49.660831+00', 'jqu72tnkoijc', '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 91, 'n3f3a3ffv2tr', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-23 21:22:37.902442+00', '2026-06-24 06:10:46.125486+00', 'ijq5qmxw5ssm', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 93, 'vreruojjgina', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', true, '2026-06-23 21:43:08.581346+00', '2026-06-24 06:19:45.138433+00', 'i77uumqsajgr', 'bc9b04d1-92eb-4f85-945b-b2accb20bd91'),
	('00000000-0000-0000-0000-000000000000', 106, 'gpnfh4epivf3', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', false, '2026-06-24 06:19:45.144212+00', '2026-06-24 06:19:45.144212+00', 'vreruojjgina', 'bc9b04d1-92eb-4f85-945b-b2accb20bd91'),
	('00000000-0000-0000-0000-000000000000', 92, 'ap2mhgsleurn', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 21:23:04.858336+00', '2026-06-24 06:33:14.771054+00', 'qboj5r6sxyyf', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 103, 'nctxlmsdom4g', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 05:33:19.811467+00', '2026-06-24 06:58:47.781074+00', 'dudfv26wbth3', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 109, 'mutu4vtshdap', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-24 07:09:21.640037+00', '2026-06-24 07:09:21.640037+00', NULL, '0d56692f-fe83-4ac5-a5d2-52cc7fe055f5'),
	('00000000-0000-0000-0000-000000000000', 83, 'qzgpkx2ty3tq', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 19:07:57.392533+00', '2026-06-24 07:24:56.279578+00', 'mzoexdlec7f2', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 110, '4eqwxhiws4te', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-24 07:24:56.289176+00', '2026-06-24 07:24:56.289176+00', 'qzgpkx2ty3tq', '4bb419b6-dc6f-42e9-9c1e-d39154e37aad'),
	('00000000-0000-0000-0000-000000000000', 85, 'ndvppfney6mj', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-23 19:10:31.528352+00', '2026-06-24 07:26:41.707567+00', 'ovxluku7nbwl', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 107, '4w3hbkwff3ap', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 06:33:14.786601+00', '2026-06-24 07:31:33.645629+00', 'ap2mhgsleurn', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 104, 'mi5pqm6my6rv', 'c2cd434b-c964-4093-acfa-924fae3e484e', true, '2026-06-24 05:49:49.668346+00', '2026-06-24 07:31:47.79403+00', 'xzozv5ybg4ca', '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 113, '3dvzr7pw7bar', 'c2cd434b-c964-4093-acfa-924fae3e484e', false, '2026-06-24 07:31:47.804136+00', '2026-06-24 07:31:47.804136+00', 'mi5pqm6my6rv', '7bfed050-b405-46f3-a0d2-49433358490a'),
	('00000000-0000-0000-0000-000000000000', 114, 'muarekfblsid', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', false, '2026-06-24 07:33:02.022387+00', '2026-06-24 07:33:02.022387+00', 'fzd6qonwwdnx', 'bef21614-6d55-4605-b744-306c273d17f6'),
	('00000000-0000-0000-0000-000000000000', 108, 'wpell4lpezit', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 06:58:47.799284+00', '2026-06-24 08:13:11.283101+00', 'nctxlmsdom4g', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 112, 'hjrymfk3ilbv', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 07:31:33.649572+00', '2026-06-24 08:29:37.342632+00', '4w3hbkwff3ap', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 117, 'o63pr22awz6n', '2daf29b4-112f-4832-be08-8e3c08d3fc91', false, '2026-06-24 08:32:49.978315+00', '2026-06-24 08:32:49.978315+00', NULL, '94351ad5-d6d4-4d28-bbd1-7375ed045baa'),
	('00000000-0000-0000-0000-000000000000', 105, 'dy7gkacqg3mr', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', true, '2026-06-24 06:10:46.131855+00', '2026-06-24 08:34:28.626673+00', 'n3f3a3ffv2tr', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 118, 'ogfpjrmlvodg', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', false, '2026-06-24 08:34:28.637641+00', '2026-06-24 08:34:28.637641+00', 'dy7gkacqg3mr', '827d7673-ee83-428b-a273-35c57becd52a'),
	('00000000-0000-0000-0000-000000000000', 102, 'fr2t7kummbx4', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', true, '2026-06-24 04:31:50.195711+00', '2026-06-24 08:44:04.651418+00', 'yl6hnstggqzy', 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 119, 'buk3xsfomxey', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', false, '2026-06-24 08:44:04.663128+00', '2026-06-24 08:44:04.663128+00', 'fr2t7kummbx4', 'd77a4a64-68f8-4166-8eed-ca723e8be8db'),
	('00000000-0000-0000-0000-000000000000', 97, 'w7wq66t2sjsj', '0930660b-5514-44f7-8b77-0729bc2966c6', true, '2026-06-23 21:46:49.330958+00', '2026-06-24 08:55:22.471088+00', 'mtm2ri6tyyzn', '4d0e2ba2-1046-4e43-bab7-205061c61403'),
	('00000000-0000-0000-0000-000000000000', 120, 'ep637blox42b', '0930660b-5514-44f7-8b77-0729bc2966c6', false, '2026-06-24 08:55:22.484557+00', '2026-06-24 08:55:22.484557+00', 'w7wq66t2sjsj', '4d0e2ba2-1046-4e43-bab7-205061c61403'),
	('00000000-0000-0000-0000-000000000000', 111, 'ac6fhn7imznf', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 07:26:41.716574+00', '2026-06-24 09:09:18.338231+00', 'ndvppfney6mj', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 121, 'hiwfwcpcyxid', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-24 09:09:18.349631+00', '2026-06-24 09:09:18.349631+00', 'ac6fhn7imznf', 'dda5ec73-8f94-4269-a881-40917a05162a'),
	('00000000-0000-0000-0000-000000000000', 100, 'pxxwdl4uftxm', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', true, '2026-06-23 22:50:16.277962+00', '2026-06-24 09:16:01.712602+00', NULL, '632b3807-3baa-4509-991e-7bc1b4358b5c'),
	('00000000-0000-0000-0000-000000000000', 122, 'bakcjy7pj2ij', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', false, '2026-06-24 09:16:01.717229+00', '2026-06-24 09:16:01.717229+00', 'pxxwdl4uftxm', '632b3807-3baa-4509-991e-7bc1b4358b5c'),
	('00000000-0000-0000-0000-000000000000', 116, 'cc2uja3spykr', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 08:29:37.351458+00', '2026-06-24 09:28:37.601057+00', 'hjrymfk3ilbv', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 123, 'qjh2phtgtb4e', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-24 09:28:37.607244+00', '2026-06-24 09:28:37.607244+00', 'cc2uja3spykr', '4506af32-e7be-4343-8275-0cd08ededd5e'),
	('00000000-0000-0000-0000-000000000000', 77, 'kn6zpjx4igdo', 'b30f1245-7316-4181-88c5-d2912822ed78', true, '2026-06-23 18:33:51.37548+00', '2026-06-24 09:38:01.803457+00', 'rlcqb3ikqjcq', 'a763e9c2-fa41-49cf-b7e5-aa286586732c'),
	('00000000-0000-0000-0000-000000000000', 124, 'hossfxsihnnp', 'b30f1245-7316-4181-88c5-d2912822ed78', false, '2026-06-24 09:38:01.812508+00', '2026-06-24 09:38:01.812508+00', 'kn6zpjx4igdo', 'a763e9c2-fa41-49cf-b7e5-aa286586732c'),
	('00000000-0000-0000-0000-000000000000', 115, 'rb76x3riheym', '884abf92-c836-4e02-bbd1-e373cdaa55cd', true, '2026-06-24 08:13:11.297357+00', '2026-06-24 09:42:01.073836+00', 'wpell4lpezit', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 125, 'dzqrhngo6beq', '884abf92-c836-4e02-bbd1-e373cdaa55cd', false, '2026-06-24 09:42:01.084316+00', '2026-06-24 09:42:01.084316+00', 'rb76x3riheym', '75ea7c28-7ccf-4fd8-8e1e-9a7a5db3aee8'),
	('00000000-0000-0000-0000-000000000000', 98, '3xyo2cqe5zx4', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', true, '2026-06-23 21:47:29.567601+00', '2026-06-24 10:07:45.348582+00', 'k34tojwu4yb7', '34e82342-7a82-4ab4-bfa8-dd62e5af6689'),
	('00000000-0000-0000-0000-000000000000', 126, 'n2iftw73zhcx', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', false, '2026-06-24 10:07:45.365548+00', '2026-06-24 10:07:45.365548+00', '3xyo2cqe5zx4', '34e82342-7a82-4ab4-bfa8-dd62e5af6689');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."teams" ("id", "name", "short_name", "fifa_code", "group_letter", "draw_position", "fifa_ranking_order", "team_conduct_score") VALUES
	('MEX', 'México', 'MEX', 'MEX', 'A', 1, 1, 0),
	('RSA', 'Sudáfrica', 'RSA', 'RSA', 'A', 2, 2, 0),
	('KOR', 'República de Corea', 'KOR', 'KOR', 'A', 3, 3, 0),
	('CZE', 'Chequia', 'CZE', 'CZE', 'A', 4, 4, 0),
	('CAN', 'Canadá', 'CAN', 'CAN', 'B', 1, 5, 0),
	('BIH', 'Bosnia y Herzegovina', 'BIH', 'BIH', 'B', 2, 6, 0),
	('QAT', 'Catar', 'QAT', 'QAT', 'B', 3, 7, 0),
	('SUI', 'Suiza', 'SUI', 'SUI', 'B', 4, 8, 0),
	('BRA', 'Brasil', 'BRA', 'BRA', 'C', 1, 9, 0),
	('MAR', 'Marruecos', 'MAR', 'MAR', 'C', 2, 10, 0),
	('HAI', 'Haití', 'HAI', 'HAI', 'C', 3, 11, 0),
	('SCO', 'Escocia', 'SCO', 'SCO', 'C', 4, 12, 0),
	('USA', 'Estados Unidos', 'USA', 'USA', 'D', 1, 13, 0),
	('PAR', 'Paraguay', 'PAR', 'PAR', 'D', 2, 14, 0),
	('AUS', 'Australia', 'AUS', 'AUS', 'D', 3, 15, 0),
	('TUR', 'Turquía', 'TUR', 'TUR', 'D', 4, 16, 0),
	('GER', 'Alemania', 'GER', 'GER', 'E', 1, 17, 0),
	('CUW', 'Curazao', 'CUW', 'CUW', 'E', 2, 18, 0),
	('CIV', 'Costa de Marfil', 'CIV', 'CIV', 'E', 3, 19, 0),
	('ECU', 'Ecuador', 'ECU', 'ECU', 'E', 4, 20, 0),
	('NED', 'Países Bajos', 'NED', 'NED', 'F', 1, 21, 0),
	('JPN', 'Japón', 'JPN', 'JPN', 'F', 2, 22, 0),
	('SWE', 'Suecia', 'SWE', 'SWE', 'F', 3, 23, 0),
	('IRQ', 'Irak', 'IRQ', 'IRQ', 'I', 3, 35, 0),
	('TUN', 'Túnez', 'TUN', 'TUN', 'F', 4, 24, 0),
	('BEL', 'Bélgica', 'BEL', 'BEL', 'G', 1, 25, 0),
	('EGY', 'Egipto', 'EGY', 'EGY', 'G', 2, 26, 0),
	('IRN', 'RI de Irán', 'IRN', 'IRN', 'G', 3, 27, 0),
	('NZL', 'Nueva Zelanda', 'NZL', 'NZL', 'G', 4, 28, 0),
	('ESP', 'España', 'ESP', 'ESP', 'H', 1, 29, 0),
	('CPV', 'Cabo Verde', 'CPV', 'CPV', 'H', 2, 30, 0),
	('KSA', 'Arabia Saudí', 'KSA', 'KSA', 'H', 3, 31, 0),
	('URU', 'Uruguay', 'URU', 'URU', 'H', 4, 32, 0),
	('FRA', 'Francia', 'FRA', 'FRA', 'I', 1, 33, 0),
	('SEN', 'Senegal', 'SEN', 'SEN', 'I', 2, 34, 0),
	('NOR', 'Noruega', 'NOR', 'NOR', 'I', 4, 36, 0),
	('ARG', 'Argentina', 'ARG', 'ARG', 'J', 1, 37, 0),
	('ALG', 'Argelia', 'ALG', 'ALG', 'J', 2, 38, 0),
	('AUT', 'Austria', 'AUT', 'AUT', 'J', 3, 39, 0),
	('JOR', 'Jordania', 'JOR', 'JOR', 'J', 4, 40, 0),
	('POR', 'Portugal', 'POR', 'POR', 'K', 1, 41, 0),
	('COD', 'RD de Congo', 'COD', 'COD', 'K', 2, 42, 0),
	('UZB', 'Uzbekistán', 'UZB', 'UZB', 'K', 3, 43, 0),
	('COL', 'Colombia', 'COL', 'COL', 'K', 4, 44, 0),
	('ENG', 'Inglaterra', 'ENG', 'ENG', 'L', 1, 45, 0),
	('CRO', 'Croacia', 'CRO', 'CRO', 'L', 2, 46, 0),
	('GHA', 'Ghana', 'GHA', 'GHA', 'L', 3, 47, 0),
	('PAN', 'Panamá', 'PAN', 'PAN', 'L', 4, 48, 0);


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."matches" ("id", "fifa_match_number", "stage", "group_letter", "kickoff_at", "venue", "status", "home_team_id", "away_team_id", "home_score", "away_score", "penalties_home", "penalties_away", "winner_team_id", "decided_by", "result_updated_at") VALUES
	('ad60c22e-ba41-4f33-85f4-8c370169e02e', 45, 'GROUP', 'K', '2026-06-23 17:00:00+00', 'Estadio Houston', 'FINAL', 'POR', 'UZB', 5, 0, NULL, NULL, 'POR', 'NORMAL_TIME', '2026-06-23 19:05:57.589674+00'),
	('b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 47, 'GROUP', 'L', '2026-06-23 20:00:00+00', 'Estadio Boston', 'FINAL', 'ENG', 'GHA', 0, 0, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 22:01:39.941334+00'),
	('a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 48, 'GROUP', 'L', '2026-06-23 23:00:00+00', 'Estadio Toronto', 'FINAL', 'PAN', 'CRO', 0, 1, NULL, NULL, 'CRO', 'NORMAL_TIME', '2026-06-24 05:33:46.60816+00'),
	('8c0619ea-3396-487d-ae83-b41835669130', 46, 'GROUP', 'K', '2026-06-24 02:00:00+00', 'Estadio Guadalajara', 'FINAL', 'COL', 'COD', 1, 0, NULL, NULL, 'COL', 'NORMAL_TIME', '2026-06-24 05:34:16.622574+00'),
	('900fc4e2-566b-426f-bbc1-cb627081fe7a', 49, 'GROUP', 'A', '2026-06-25 01:00:00+00', 'Estadio Ciudad de México', 'SCHEDULED', 'CZE', 'MEX', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('dcc19d77-f944-49c2-98f2-45f9a2523dea', 50, 'GROUP', 'A', '2026-06-25 01:00:00+00', 'Estadio Monterrey', 'SCHEDULED', 'RSA', 'KOR', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('97e9ab13-e5a8-4977-95da-0d176a85541b', 51, 'GROUP', 'B', '2026-06-24 19:00:00+00', 'Estadio BC Place Vancouver', 'SCHEDULED', 'SUI', 'CAN', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('ae0e8de9-9093-4951-956e-972a2c014017', 52, 'GROUP', 'B', '2026-06-24 19:00:00+00', 'Estadio Seattle', 'SCHEDULED', 'BIH', 'QAT', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('9f901dcc-8ab1-4a08-9f04-b3602b369273', 53, 'GROUP', 'C', '2026-06-24 22:00:00+00', 'Estadio Miami', 'SCHEDULED', 'BRA', 'SCO', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('92d7d1c9-a6e8-473f-bec8-5568962c823a', 54, 'GROUP', 'C', '2026-06-24 22:00:00+00', 'Estadio Atlanta', 'SCHEDULED', 'MAR', 'HAI', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('8b7a11a0-aa78-4b7c-a1bd-0a6f5b9eaef8', 55, 'GROUP', 'D', '2026-06-26 02:00:00+00', 'Estadio Los Ángeles', 'SCHEDULED', 'TUR', 'USA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('23871764-fbc9-48bd-9b70-0c094967d280', 56, 'GROUP', 'D', '2026-06-26 02:00:00+00', 'Estadio Bahía de San Francisco', 'SCHEDULED', 'PAR', 'AUS', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('146b03ac-e80d-47b6-be06-5fc6d977290b', 57, 'GROUP', 'E', '2026-06-25 20:00:00+00', 'Estadio Filadelfia', 'SCHEDULED', 'CUW', 'CIV', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('aa3d4cb4-b66c-4923-a034-69e4568327d0', 58, 'GROUP', 'E', '2026-06-25 20:00:00+00', 'Estadio Nueva York Nueva Jersey', 'SCHEDULED', 'ECU', 'GER', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('2deaabc7-53f2-491a-aa77-1ea793c39498', 59, 'GROUP', 'F', '2026-06-25 23:00:00+00', 'Estadio Dallas', 'SCHEDULED', 'JPN', 'SWE', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('33a108d4-8882-4b2a-b9ee-c331273d490e', 60, 'GROUP', 'F', '2026-06-25 23:00:00+00', 'Estadio Kansas City', 'SCHEDULED', 'TUN', 'NED', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('8215cedc-de82-49b7-bd84-1ef7219b507f', 6, 'GROUP', 'C', '2026-06-13 22:00:00+00', 'Estadio Nueva York Nueva Jersey', 'FINAL', 'BRA', 'MAR', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('e84f63f3-ce14-4f2f-88c6-db81ff7d9715', 7, 'GROUP', 'C', '2026-06-14 01:00:00+00', 'Estadio Boston', 'FINAL', 'HAI', 'SCO', 0, 1, NULL, NULL, 'SCO', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('09d1897a-d8c7-4385-8aca-e3f1df68c210', 8, 'GROUP', 'D', '2026-06-14 03:00:00+00', 'Estadio BC Place Vancouver', 'FINAL', 'AUS', 'TUR', 2, 0, NULL, NULL, 'AUS', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('84b1964f-474c-49e3-875b-bf5fcc2f2e9b', 9, 'GROUP', 'E', '2026-06-14 16:00:00+00', 'Estadio Houston', 'FINAL', 'GER', 'CUW', 7, 1, NULL, NULL, 'GER', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('ae56ddde-fcd9-469f-ae07-76f447bce86d', 10, 'GROUP', 'E', '2026-06-14 19:00:00+00', 'Estadio Filadelfia', 'FINAL', 'CIV', 'ECU', 1, 0, NULL, NULL, 'CIV', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('3ca9520d-c5ff-4bd4-806e-0c1dcffff97c', 11, 'GROUP', 'F', '2026-06-14 22:00:00+00', 'Estadio Dallas', 'FINAL', 'NED', 'JPN', 2, 2, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('32a3769f-c173-4273-8cda-a12330a207f8', 12, 'GROUP', 'F', '2026-06-15 01:00:00+00', 'Estadio Monterrey', 'FINAL', 'SWE', 'TUN', 5, 1, NULL, NULL, 'SWE', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('748e1aea-9cf8-4d9f-9faa-ca889ce0e092', 13, 'GROUP', 'G', '2026-06-15 19:00:00+00', 'Estadio Seattle', 'FINAL', 'BEL', 'EGY', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('22004564-6348-4c2d-b85e-b4fe464be12f', 14, 'GROUP', 'G', '2026-06-16 01:00:00+00', 'Estadio Los Ángeles', 'FINAL', 'IRN', 'NZL', 2, 2, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('c9583e1d-3c84-4b67-a85a-5dee219c5fc2', 15, 'GROUP', 'H', '2026-06-15 22:00:00+00', 'Estadio Atlanta', 'FINAL', 'ESP', 'CPV', 0, 0, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('af08a4f5-7509-490d-9b46-72a1ccc2fffe', 16, 'GROUP', 'H', '2026-06-16 01:00:00+00', 'Estadio Miami', 'FINAL', 'KSA', 'URU', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('dc5fa5c0-0b33-4ee2-9d8f-16d5e86885c4', 23, 'GROUP', 'L', '2026-06-17 22:00:00+00', 'Estadio Dallas', 'FINAL', 'ENG', 'CRO', 4, 2, NULL, NULL, 'ENG', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('f21725a6-b7fb-41db-9f90-acfad71ecdaf', 24, 'GROUP', 'L', '2026-06-18 01:00:00+00', 'Estadio Toronto', 'FINAL', 'GHA', 'PAN', 1, 0, NULL, NULL, 'GHA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('006c915e-9512-4b21-9c4b-3affc315c1fa', 25, 'GROUP', 'A', '2026-06-18 19:00:00+00', 'Estadio Atlanta', 'FINAL', 'CZE', 'RSA', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('ace857ac-ef08-4ca2-9485-786960d77ed7', 26, 'GROUP', 'A', '2026-06-19 01:00:00+00', 'Estadio Guadalajara', 'FINAL', 'MEX', 'KOR', 1, 0, NULL, NULL, 'MEX', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('aab27f79-41d4-4272-b5aa-de761b995882', 27, 'GROUP', 'B', '2026-06-18 22:00:00+00', 'Estadio Los Ángeles', 'FINAL', 'SUI', 'BIH', 4, 1, NULL, NULL, 'SUI', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('d3091043-f71b-44bf-bfc3-516a2fbdc5e5', 28, 'GROUP', 'B', '2026-06-19 03:00:00+00', 'Estadio BC Place Vancouver', 'FINAL', 'CAN', 'QAT', 6, 0, NULL, NULL, 'CAN', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('28c8da77-4088-4833-bf8c-a3887dbf8596', 29, 'GROUP', 'C', '2026-06-19 19:00:00+00', 'Estadio Boston', 'FINAL', 'SCO', 'MAR', 0, 1, NULL, NULL, 'MAR', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('1a89df05-277c-4274-b433-6520d5330c7d', 30, 'GROUP', 'C', '2026-06-19 22:00:00+00', 'Estadio Filadelfia', 'FINAL', 'BRA', 'HAI', 3, 0, NULL, NULL, 'BRA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('9fd8cfc2-07e9-4f96-bfc2-e3da4a168d27', 31, 'GROUP', 'D', '2026-06-20 01:00:00+00', 'Estadio Seattle', 'FINAL', 'USA', 'AUS', 2, 0, NULL, NULL, 'USA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('8d5927b5-f411-43bd-b03e-91cddd43e81b', 32, 'GROUP', 'D', '2026-06-20 03:00:00+00', 'Estadio Bahía de San Francisco', 'FINAL', 'TUR', 'PAR', 0, 1, NULL, NULL, 'PAR', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('44f2b5d8-a517-40a4-b117-0ba1a489ea97', 42, 'GROUP', 'I', '2026-06-23 00:00:00+00', 'Estadio Nueva York Nueva Jersey', 'FINAL', 'NOR', 'SEN', 3, 2, NULL, NULL, 'NOR', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('7a3526b4-1c3c-4c46-b84e-464085239ac0', 44, 'GROUP', 'J', '2026-06-23 03:00:00+00', 'Estadio Bahía de San Francisco', 'FINAL', 'JOR', 'ALG', 1, 2, NULL, NULL, 'ALG', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('4264be1d-d557-45d7-9a44-195fc2cf9195', 34, 'GROUP', 'E', '2026-06-21 02:00:00+00', 'Estadio Kansas City', 'FINAL', 'ECU', 'CUW', 0, 0, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('c2867290-cdee-4892-b555-cedab0b88b84', 37, 'GROUP', 'G', '2026-06-21 19:00:00+00', 'Estadio Los Ángeles', 'FINAL', 'BEL', 'IRN', 0, 0, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('95ad0b14-9897-49d0-8c22-ff92602db531', 38, 'GROUP', 'G', '2026-06-22 01:00:00+00', 'Estadio BC Place Vancouver', 'FINAL', 'NZL', 'EGY', 1, 3, NULL, NULL, 'EGY', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('8f26d997-045b-4cea-b73a-920204fad740', 43, 'GROUP', 'J', '2026-06-22 17:00:00+00', 'Estadio Dallas', 'FINAL', 'ARG', 'AUT', 2, 0, NULL, NULL, 'ARG', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('a843c8a6-b1a2-4e20-b59c-7fee955952db', 41, 'GROUP', 'I', '2026-06-22 21:00:00+00', 'Estadio Filadelfia', 'FINAL', 'FRA', 'IRQ', 3, 0, NULL, NULL, 'FRA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('75486c46-dcb4-453e-a7bf-dd4525444e84', 39, 'GROUP', 'H', '2026-06-21 16:00:00+00', 'Estadio Atlanta', 'FINAL', 'ESP', 'KSA', 4, 0, NULL, NULL, 'ESP', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('980c13f8-5499-49d7-948d-8b5dbf06ba58', 40, 'GROUP', 'H', '2026-06-21 22:00:00+00', 'Estadio Miami', 'FINAL', 'URU', 'CPV', 2, 2, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('e24a5b01-1406-480d-8e30-2568d3e40811', 36, 'GROUP', 'F', '2026-06-20 04:00:00+00', 'Estadio Monterrey', 'FINAL', 'TUN', 'JPN', 0, 4, NULL, NULL, 'JPN', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('2afca96e-7d82-4623-98f7-afbb3d94e426', 35, 'GROUP', 'F', '2026-06-20 17:00:00+00', 'Estadio Houston', 'FINAL', 'NED', 'SWE', 5, 1, NULL, NULL, 'NED', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('cf3df38e-5017-4f90-abb8-1187eb1ec2ed', 33, 'GROUP', 'E', '2026-06-20 20:00:00+00', 'Estadio Toronto', 'FINAL', 'GER', 'CIV', 2, 1, NULL, NULL, 'GER', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('3a59e483-e0be-43c2-bc3e-eed7893a2c79', 1, 'GROUP', 'A', '2026-06-11 19:00:00+00', 'Estadio Ciudad de México', 'FINAL', 'MEX', 'RSA', 2, 0, NULL, NULL, 'MEX', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('069aad1b-fdd8-489b-b37f-3b1a55127cc7', 2, 'GROUP', 'A', '2026-06-12 01:00:00+00', 'Estadio Guadalajara', 'FINAL', 'KOR', 'CZE', 2, 1, NULL, NULL, 'KOR', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('353509ce-9a66-4a3c-8324-8c800b451e1a', 3, 'GROUP', 'B', '2026-06-12 19:00:00+00', 'Estadio Toronto', 'FINAL', 'CAN', 'BIH', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('cadbcf7f-dacc-4eef-a014-e09a028abb13', 4, 'GROUP', 'D', '2026-06-13 01:00:00+00', 'Estadio Los Ángeles', 'FINAL', 'USA', 'PAR', 4, 1, NULL, NULL, 'USA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('ddf7f876-e9d3-4c92-9d10-747f825c682a', 5, 'GROUP', 'B', '2026-06-13 19:00:00+00', 'Estadio Bahía de San Francisco', 'FINAL', 'QAT', 'SUI', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('89a541ef-9fda-4ed7-adf6-6dd763be7a91', 17, 'GROUP', 'I', '2026-06-16 19:00:00+00', 'Estadio Nueva York Nueva Jersey', 'FINAL', 'FRA', 'SEN', 3, 1, NULL, NULL, 'FRA', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('1e227a69-d000-44e9-a91a-d7a151e5c84e', 18, 'GROUP', 'I', '2026-06-16 22:00:00+00', 'Estadio Boston', 'FINAL', 'IRQ', 'NOR', 1, 4, NULL, NULL, 'NOR', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('10398028-563d-4d39-9ab5-6291219f91ca', 19, 'GROUP', 'J', '2026-06-17 01:00:00+00', 'Estadio Kansas City', 'FINAL', 'ARG', 'ALG', 3, 0, NULL, NULL, 'ARG', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('8487e801-4704-42ef-a8ec-b5a72ab1578f', 20, 'GROUP', 'J', '2026-06-17 03:00:00+00', 'Estadio Bahía de San Francisco', 'FINAL', 'AUT', 'JOR', 3, 1, NULL, NULL, 'AUT', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('cd780ceb-0059-40d0-8c7f-06576b2e33d1', 21, 'GROUP', 'K', '2026-06-17 19:00:00+00', 'Estadio Houston', 'FINAL', 'POR', 'COD', 1, 1, NULL, NULL, NULL, 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('2de8d034-c634-4807-aadf-a93741ba791c', 22, 'GROUP', 'K', '2026-06-18 01:00:00+00', 'Estadio Ciudad de México', 'FINAL', 'UZB', 'COL', 1, 3, NULL, NULL, 'COL', 'NORMAL_TIME', '2026-06-23 10:10:40.030947+00'),
	('1186f3f2-b515-4094-b113-8e6fa061d76b', 61, 'GROUP', 'G', '2026-06-27 03:00:00+00', 'Estadio Seattle', 'SCHEDULED', 'EGY', 'IRN', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('ea420e79-c762-44ca-aebc-c4af39c58d0f', 62, 'GROUP', 'G', '2026-06-27 03:00:00+00', 'Estadio BC Place Vancouver', 'SCHEDULED', 'NZL', 'BEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('c5a9e458-9080-4357-8714-39a0dee7b240', 63, 'GROUP', 'H', '2026-06-27 00:00:00+00', 'Estadio Houston', 'SCHEDULED', 'CPV', 'KSA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('164e8c3b-d424-4ba5-b5ac-fdf1277fd043', 64, 'GROUP', 'H', '2026-06-27 00:00:00+00', 'Estadio Guadalajara', 'SCHEDULED', 'URU', 'ESP', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('5c3e5479-d5e3-431f-bcb2-140b3d61b5eb', 65, 'GROUP', 'I', '2026-06-26 19:00:00+00', 'Estadio Boston', 'SCHEDULED', 'NOR', 'FRA', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b80cd4d3-ee46-4d92-ad7b-53bc828d8022', 66, 'GROUP', 'I', '2026-06-26 19:00:00+00', 'Estadio Toronto', 'SCHEDULED', 'SEN', 'IRQ', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('e3038c83-2765-403a-844b-216ef0f527bd', 67, 'GROUP', 'J', '2026-06-28 02:00:00+00', 'Estadio Kansas City', 'SCHEDULED', 'ALG', 'AUT', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('caeadca1-39b0-435e-aa60-a970c5502ee0', 68, 'GROUP', 'J', '2026-06-28 02:00:00+00', 'Estadio Dallas', 'SCHEDULED', 'JOR', 'ARG', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('fe43917e-a5c6-4c4c-8143-e5f8c58a764a', 69, 'GROUP', 'K', '2026-06-27 23:30:00+00', 'Estadio Miami', 'SCHEDULED', 'COL', 'POR', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('b94c36e9-731a-489a-988b-ac7447afe59c', 70, 'GROUP', 'K', '2026-06-27 23:30:00+00', 'Estadio Atlanta', 'SCHEDULED', 'COD', 'UZB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('fd92bfe4-47f8-423b-9b40-1c2dd8fbc2a1', 71, 'GROUP', 'L', '2026-06-27 21:00:00+00', 'Estadio Nueva York Nueva Jersey', 'SCHEDULED', 'PAN', 'ENG', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('08639572-4f9b-467e-931f-9550685d8715', 72, 'GROUP', 'L', '2026-06-27 21:00:00+00', 'Estadio Filadelfia', 'SCHEDULED', 'CRO', 'GHA', NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "display_name", "is_admin", "created_at") VALUES
	('884abf92-c836-4e02-bbd1-e373cdaa55cd', 'Pollo', true, '2026-06-22 08:47:44.910952+00'),
	('b30f1245-7316-4181-88c5-d2912822ed78', 'BofasALLIN', false, '2026-06-23 09:40:41.950105+00'),
	('fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'Fonsilátero', false, '2026-06-23 09:51:16.39736+00'),
	('4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'Agus', false, '2026-06-23 09:53:43.475345+00'),
	('f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'Arroyo', false, '2026-06-23 09:54:36.181268+00'),
	('2daf29b4-112f-4832-be08-8e3c08d3fc91', 'Jaime4', false, '2026-06-23 10:24:09.022378+00'),
	('d47244ae-6b64-4b0f-a9b9-1815a6328d01', 'Nacho Simó', false, '2026-06-23 10:37:10.906218+00'),
	('c2cd434b-c964-4093-acfa-924fae3e484e', 'Alvion', false, '2026-06-23 12:51:51.882702+00'),
	('2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'Antonio', false, '2026-06-23 12:53:34.650796+00'),
	('8fa00e77-689b-4f66-b327-4600e7617d3e', 'Dudas', false, '2026-06-23 12:57:24.668363+00'),
	('0930660b-5514-44f7-8b77-0729bc2966c6', 'Cordoba', false, '2026-06-23 16:15:06.538462+00'),
	('59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'Miguel', false, '2026-06-23 16:25:28.755327+00');


--
-- Data for Name: admin_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_audit_log" ("id", "admin_user_id", "action", "match_id", "payload", "created_at") VALUES
	('e3915b1e-5887-4725-8ee0-5c07aa300491', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'RESULT_UPSERT', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', '{"away_score": 0, "decided_by": "NORMAL_TIME", "home_score": 5, "winner_team_id": "POR", "updated_predictions": 11}', '2026-06-23 19:05:57.589674+00'),
	('38558e1a-ada2-4e7d-b6c3-a77495f5526a', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'RESULT_UPSERT', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', '{"away_score": 0, "decided_by": "NORMAL_TIME", "home_score": 0, "winner_team_id": null, "updated_predictions": 12}', '2026-06-23 22:01:39.941334+00'),
	('7fc4a146-3aed-45ac-a85e-2f365242bc10', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'RESULT_UPSERT', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', '{"away_score": 1, "decided_by": "NORMAL_TIME", "home_score": 0, "winner_team_id": "CRO", "updated_predictions": 12}', '2026-06-24 05:33:46.60816+00'),
	('5f64f39c-faf9-46bb-bcb9-21e43b3ffc4b', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'RESULT_UPSERT', '8c0619ea-3396-487d-ae83-b41835669130', '{"away_score": 0, "decided_by": "NORMAL_TIME", "home_score": 1, "winner_team_id": "COL", "updated_predictions": 12}', '2026-06-24 05:34:16.622574+00');


--
-- Data for Name: app_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_team_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."group_team_stats" ("team_id", "group_letter", "played", "wins", "draws", "losses", "goals_for", "goals_against", "goal_difference", "points", "team_conduct_score", "rank", "updated_at") VALUES
	('MEX', 'A', 2, 2, 0, 0, 3, 0, 3, 6, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('KOR', 'A', 2, 1, 0, 1, 2, 2, 0, 3, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('CZE', 'A', 2, 0, 1, 1, 2, 3, -1, 1, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('RSA', 'A', 2, 0, 1, 1, 1, 3, -2, 1, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('CAN', 'B', 2, 1, 1, 0, 7, 1, 6, 4, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('SUI', 'B', 2, 1, 1, 0, 5, 2, 3, 4, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('BIH', 'B', 2, 0, 1, 1, 2, 5, -3, 1, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('QAT', 'B', 2, 0, 1, 1, 1, 7, -6, 1, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('BRA', 'C', 2, 1, 1, 0, 4, 1, 3, 4, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('MAR', 'C', 2, 1, 1, 0, 2, 1, 1, 4, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('SCO', 'C', 2, 1, 0, 1, 1, 1, 0, 3, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('HAI', 'C', 2, 0, 0, 2, 0, 4, -4, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('USA', 'D', 2, 2, 0, 0, 6, 1, 5, 6, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('AUS', 'D', 2, 1, 0, 1, 2, 2, 0, 3, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('PAR', 'D', 2, 1, 0, 1, 2, 4, -2, 3, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('TUR', 'D', 2, 0, 0, 2, 0, 3, -3, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('GER', 'E', 2, 2, 0, 0, 9, 2, 7, 6, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('CIV', 'E', 2, 1, 0, 1, 2, 2, 0, 3, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('ECU', 'E', 2, 0, 1, 1, 0, 1, -1, 1, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('CUW', 'E', 2, 0, 1, 1, 1, 7, -6, 1, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('NED', 'F', 2, 1, 1, 0, 7, 3, 4, 4, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('JPN', 'F', 2, 1, 1, 0, 6, 2, 4, 4, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('SWE', 'F', 2, 1, 0, 1, 6, 6, 0, 3, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('TUN', 'F', 2, 0, 0, 2, 1, 9, -8, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('EGY', 'G', 2, 1, 1, 0, 4, 2, 2, 4, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('IRN', 'G', 2, 0, 2, 0, 2, 2, 0, 2, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('BEL', 'G', 2, 0, 2, 0, 1, 1, 0, 2, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('NZL', 'G', 2, 0, 1, 1, 3, 5, -2, 1, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('ESP', 'H', 2, 1, 1, 0, 4, 0, 4, 4, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('URU', 'H', 2, 0, 2, 0, 3, 3, 0, 2, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('CPV', 'H', 2, 0, 2, 0, 2, 2, 0, 2, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('KSA', 'H', 2, 0, 1, 1, 1, 5, -4, 1, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('FRA', 'I', 2, 2, 0, 0, 6, 1, 5, 6, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('NOR', 'I', 2, 2, 0, 0, 7, 3, 4, 6, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('SEN', 'I', 2, 0, 0, 2, 3, 6, -3, 0, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('IRQ', 'I', 2, 0, 0, 2, 1, 7, -6, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('ARG', 'J', 2, 2, 0, 0, 5, 0, 5, 6, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('AUT', 'J', 2, 1, 0, 1, 3, 3, 0, 3, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('ALG', 'J', 2, 1, 0, 1, 2, 4, -2, 3, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('JOR', 'J', 2, 0, 0, 2, 2, 5, -3, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('COL', 'K', 1, 1, 0, 0, 3, 1, 2, 3, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('POR', 'K', 1, 0, 1, 0, 1, 1, 0, 1, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('COD', 'K', 1, 0, 1, 0, 1, 1, 0, 1, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('UZB', 'K', 1, 0, 0, 1, 1, 3, -2, 0, 0, 4, '2026-06-23 10:10:40.030947+00'),
	('ENG', 'L', 1, 1, 0, 0, 4, 2, 2, 3, 0, 1, '2026-06-23 10:10:40.030947+00'),
	('GHA', 'L', 1, 1, 0, 0, 1, 0, 1, 3, 0, 2, '2026-06-23 10:10:40.030947+00'),
	('PAN', 'L', 1, 0, 0, 1, 0, 1, -1, 0, 0, 3, '2026-06-23 10:10:40.030947+00'),
	('CRO', 'L', 1, 0, 0, 1, 2, 4, -2, 0, 0, 4, '2026-06-23 10:10:40.030947+00');


--
-- Data for Name: match_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: official_awards; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: prediction_email_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."prediction_email_reminders" ("id", "user_id", "match_id", "reminder_kind", "status", "error", "sent_at", "created_at") VALUES
	('f604cf07-0864-4734-914c-388a895e39ed', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 'missing_prediction_2h', 'sent', NULL, '2026-06-23 16:20:02.38+00', '2026-06-23 16:20:01.827141+00'),
	('4e2e74a8-f520-4483-9f5c-d9cc1a7a7f06', '0930660b-5514-44f7-8b77-0729bc2966c6', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 'missing_prediction_2h', 'sent', NULL, '2026-06-23 21:00:02.154+00', '2026-06-23 21:00:01.565958+00');


--
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."predictions" ("id", "user_id", "match_id", "predicted_home_score", "predicted_away_score", "predicted_advancing_team_id", "points_awarded", "is_void", "created_at", "updated_at") VALUES
	('3c7dc3c1-ef27-4cf5-be13-9262aede21e8', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 0, NULL, 0, false, '2026-06-23 16:18:55.357882+00', '2026-06-23 16:18:55.357882+00'),
	('4e123532-9d41-4f6c-8678-752222edd67e', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '97e9ab13-e5a8-4977-95da-0d176a85541b', 0, 0, NULL, 0, false, '2026-06-23 10:26:45.377881+00', '2026-06-23 10:26:45.377881+00'),
	('2a165abf-3b91-4358-8fab-5b49411df3d4', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 0, NULL, 0, false, '2026-06-23 10:27:12.218621+00', '2026-06-23 10:27:12.218621+00'),
	('72aa2e13-90b3-48eb-b099-34564ccf5219', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 2, 0, NULL, 0, false, '2026-06-23 10:27:52.343428+00', '2026-06-23 10:27:52.343428+00'),
	('efb9cf2c-f97c-4db7-bb6f-6531409c3f0a', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 2, 0, NULL, 0, false, '2026-06-23 10:27:58.156565+00', '2026-06-23 10:27:58.156565+00'),
	('c6274241-7a9c-4e14-a1de-53f231113443', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-23 10:28:05.402807+00', '2026-06-23 10:28:05.402807+00'),
	('fdb255c3-01de-41d5-9af0-03f19534a354', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 1, 2, NULL, 0, false, '2026-06-23 10:28:27.495902+00', '2026-06-23 10:28:27.495902+00'),
	('d9e1fcd8-c7fe-463d-b34d-43be2d30a897', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '97e9ab13-e5a8-4977-95da-0d176a85541b', 1, 1, NULL, 0, false, '2026-06-23 12:05:47.020743+00', '2026-06-23 12:05:49.793485+00'),
	('3fb46c50-4f76-4001-99ac-298816199ef5', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'ae0e8de9-9093-4951-956e-972a2c014017', 0, 0, NULL, 0, false, '2026-06-23 12:05:54.509334+00', '2026-06-23 12:05:54.509334+00'),
	('1badc163-cfe2-4205-93b1-508c18d999d5', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 3, 1, NULL, 0, false, '2026-06-23 12:06:02.580511+00', '2026-06-23 12:06:02.580511+00'),
	('95b28f0b-c309-40ff-bc5c-cc0799870086', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 2, 0, NULL, 0, false, '2026-06-23 12:06:07.817543+00', '2026-06-23 12:06:07.817543+00'),
	('e4d3ab11-489f-42bf-ba11-b8514a2d3728', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-23 12:06:14.27336+00', '2026-06-23 12:06:14.27336+00'),
	('b2075107-6c20-4ef4-bbb2-220c066fafc2', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 0, 1, NULL, 0, false, '2026-06-23 12:06:20.549174+00', '2026-06-23 12:06:20.549174+00'),
	('3e334616-4e46-474f-940f-b5689e15daed', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '97e9ab13-e5a8-4977-95da-0d176a85541b', 1, 1, NULL, 0, false, '2026-06-23 16:28:24.631769+00', '2026-06-23 16:28:24.631769+00'),
	('6888a1d2-4fde-422d-9846-bfe8bb81a6bc', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '97e9ab13-e5a8-4977-95da-0d176a85541b', 1, 1, NULL, 0, false, '2026-06-23 15:21:06.570251+00', '2026-06-23 15:21:32.548205+00'),
	('8158acf5-1c9f-436f-8e5e-c19cd2b00534', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'ae0e8de9-9093-4951-956e-972a2c014017', 0, 1, NULL, 0, false, '2026-06-23 15:21:41.076485+00', '2026-06-23 15:21:41.076485+00'),
	('c2dc4e45-843e-4f19-b0f0-e4902bafd1b2', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 2, 0, NULL, 0, false, '2026-06-23 15:21:48.273571+00', '2026-06-23 15:21:48.273571+00'),
	('f978d64e-cc62-46b2-9332-ea8428215b65', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 2, 0, NULL, 0, false, '2026-06-23 15:21:56.23053+00', '2026-06-23 15:21:56.23053+00'),
	('7aa39195-146d-4cb2-8560-d890910411e5', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-23 15:22:08.124874+00', '2026-06-23 15:22:08.124874+00'),
	('fd777258-c547-4452-96d9-4683366bb261', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 0, 1, NULL, 0, false, '2026-06-23 15:22:14.453338+00', '2026-06-23 15:22:14.453338+00'),
	('9456bed4-5eaa-41ad-a6c7-a029960ef16d', 'c2cd434b-c964-4093-acfa-924fae3e484e', '97e9ab13-e5a8-4977-95da-0d176a85541b', 1, 1, NULL, 0, false, '2026-06-23 16:17:56.184119+00', '2026-06-23 16:17:56.184119+00'),
	('7d29e093-5358-4f94-b5c1-e4e71cc23a7a', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 1, NULL, 0, false, '2026-06-23 16:28:26.200528+00', '2026-06-23 16:28:26.200528+00'),
	('f540ba58-1c36-487b-9028-c59a19e59242', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 2, 1, NULL, 0, false, '2026-06-23 16:28:27.556024+00', '2026-06-23 16:28:27.556024+00'),
	('5ad19241-6932-43f5-92eb-f3d9d15c624a', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 3, 1, NULL, 0, false, '2026-06-23 16:28:28.897979+00', '2026-06-23 16:28:28.897979+00'),
	('d765fe05-e28e-447a-8ff1-eabfa0601636', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-23 16:28:30.354339+00', '2026-06-23 16:28:30.354339+00'),
	('c032fb0d-cfaa-42f1-8a33-3e0a4eb32d41', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 4, 1, NULL, 1, false, '2026-06-23 16:28:13.665413+00', '2026-06-23 19:05:57.589674+00'),
	('e4c76393-01ac-48f3-a08f-164d4c56a247', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 2, 1, NULL, 0, false, '2026-06-23 16:28:18.843552+00', '2026-06-23 22:01:39.941334+00'),
	('5f80aa7b-750b-4458-91cd-f7e8ec066041', 'b30f1245-7316-4181-88c5-d2912822ed78', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 3, 1, NULL, 0, false, '2026-06-23 09:47:27.447751+00', '2026-06-23 22:01:39.941334+00'),
	('7b00758b-6387-41a0-a06e-ac2b8a3e8726', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 4, 1, NULL, 0, false, '2026-06-23 09:59:44.3534+00', '2026-06-23 22:01:39.941334+00'),
	('4d3d166f-edd2-4a21-8a42-8e913f9a94ec', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 2, 0, NULL, 0, false, '2026-06-23 10:23:22.060983+00', '2026-06-23 22:01:39.941334+00'),
	('c9715103-cbeb-4b54-b9e6-e07de15cb65d', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 3, 0, NULL, 0, false, '2026-06-23 10:38:04.892507+00', '2026-06-23 22:01:39.941334+00'),
	('df8006b0-b31c-46dd-9f9e-2fd07648dc78', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 3, 1, NULL, 0, false, '2026-06-23 12:05:32.058176+00', '2026-06-23 22:01:39.941334+00'),
	('e2d98d15-3e46-455b-9f6b-1ad6b35174b9', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 1, 0, NULL, 0, false, '2026-06-23 13:16:38.954266+00', '2026-06-23 22:01:39.941334+00'),
	('654c186f-11be-44ba-bad7-1f8d127790a5', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 2, 0, NULL, 0, false, '2026-06-23 15:20:44.590367+00', '2026-06-23 22:01:39.941334+00'),
	('7b68c352-3ee8-441b-83dd-e97dd4e5400f', '0930660b-5514-44f7-8b77-0729bc2966c6', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 2, 2, NULL, 1, false, '2026-06-23 16:16:19.313153+00', '2026-06-23 22:01:39.941334+00'),
	('1e5d8326-7535-4f05-8962-27dadbb4639e', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 5, 0, NULL, 0, false, '2026-06-23 16:17:36.332535+00', '2026-06-23 22:01:39.941334+00'),
	('817317b2-6b77-42a1-9324-6dc5c89036ff', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 1, 3, NULL, 1, false, '2026-06-23 16:28:20.855744+00', '2026-06-24 05:33:46.60816+00'),
	('f5f2915e-4735-4054-8a68-dbee2b158fd3', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 1, 2, NULL, 1, false, '2026-06-23 09:59:20.597424+00', '2026-06-24 05:33:46.60816+00'),
	('b2c7c175-3d41-421e-b181-3199bee60422', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 3, NULL, 1, false, '2026-06-23 10:23:34.72481+00', '2026-06-24 05:33:46.60816+00'),
	('be9766af-e7c3-4dff-8f94-d033cecaabae', 'b30f1245-7316-4181-88c5-d2912822ed78', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 2, NULL, 1, false, '2026-06-23 10:42:07.550447+00', '2026-06-24 05:33:46.60816+00'),
	('4baba83a-437e-4360-9789-65d254b88ec3', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 1, 2, NULL, 1, false, '2026-06-23 12:05:30.08723+00', '2026-06-24 05:33:46.60816+00'),
	('4e99b94b-2d59-400a-8c81-4996a8d8265c', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 2, NULL, 1, false, '2026-06-23 13:17:45.887728+00', '2026-06-24 05:33:46.60816+00'),
	('257a9207-11f3-4b4c-953a-f92a73c3cc85', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 1, 2, NULL, 1, false, '2026-06-23 15:20:53.071674+00', '2026-06-24 05:33:46.60816+00'),
	('f1eaa1f3-acb5-4b1d-90d2-84d25c99abc8', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 1, 2, NULL, 1, false, '2026-06-23 15:46:22.038427+00', '2026-06-24 05:33:46.60816+00'),
	('094a2379-335b-4de0-8f0a-de9ad344a74b', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 1, NULL, 3, false, '2026-06-23 16:17:42.125272+00', '2026-06-24 05:33:46.60816+00'),
	('348533c2-9850-490c-bd33-305c8fee0db2', '8fa00e77-689b-4f66-b327-4600e7617d3e', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 2, NULL, 1, false, '2026-06-23 16:18:33.797106+00', '2026-06-24 05:33:46.60816+00'),
	('8b6c35d8-b639-41c4-a60f-ff4c5f2a0797', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 2, NULL, 1, false, '2026-06-23 18:48:37.048761+00', '2026-06-24 05:33:46.60816+00'),
	('b3ae5222-52f5-4af5-8fbe-7048dd306121', '59432c84-2a2e-4362-8dc9-c4ee8c1611fa', '8c0619ea-3396-487d-ae83-b41835669130', 1, 0, NULL, 3, false, '2026-06-23 16:28:23.025458+00', '2026-06-24 05:34:16.622574+00'),
	('bbff894b-1887-4c53-a215-707b6e3db4a2', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '8c0619ea-3396-487d-ae83-b41835669130', 2, 2, NULL, 0, false, '2026-06-23 09:59:28.751932+00', '2026-06-24 05:34:16.622574+00'),
	('ec534140-d951-40d0-87fc-b85489701f80', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', '8c0619ea-3396-487d-ae83-b41835669130', 2, 1, NULL, 1, false, '2026-06-23 10:23:19.839537+00', '2026-06-24 05:34:16.622574+00'),
	('db23c210-3cc6-4246-b84d-188ee1f3a6aa', 'b30f1245-7316-4181-88c5-d2912822ed78', '8c0619ea-3396-487d-ae83-b41835669130', 2, 1, NULL, 1, false, '2026-06-23 10:42:06.074846+00', '2026-06-24 05:34:16.622574+00'),
	('86464e15-8c9b-4412-b7be-0d84f2ef394c', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', '8c0619ea-3396-487d-ae83-b41835669130', 2, 0, NULL, 1, false, '2026-06-23 12:05:41.490236+00', '2026-06-24 05:34:16.622574+00'),
	('aad3dbe3-68a7-4518-96ed-12f59f4b7172', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '8c0619ea-3396-487d-ae83-b41835669130', 2, 0, NULL, 1, false, '2026-06-23 13:18:13.037643+00', '2026-06-24 05:34:16.622574+00'),
	('a97e8708-cec6-42b2-9e3a-77dfff8d1064', '2daf29b4-112f-4832-be08-8e3c08d3fc91', '8c0619ea-3396-487d-ae83-b41835669130', 3, 0, NULL, 1, false, '2026-06-23 15:21:02.412827+00', '2026-06-24 05:34:16.622574+00'),
	('3c32723b-255e-4481-b8fa-fab1d31db042', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', '8c0619ea-3396-487d-ae83-b41835669130', 2, 1, NULL, 1, false, '2026-06-23 15:52:30.951632+00', '2026-06-24 05:34:16.622574+00'),
	('2e657b4b-df2f-476d-932a-41018ae6163b', 'c2cd434b-c964-4093-acfa-924fae3e484e', '8c0619ea-3396-487d-ae83-b41835669130', 2, 1, NULL, 1, false, '2026-06-23 16:17:50.955547+00', '2026-06-24 05:34:16.622574+00'),
	('452a0b53-8bd4-4ac9-823c-f6fd9e0a85b3', '8fa00e77-689b-4f66-b327-4600e7617d3e', '8c0619ea-3396-487d-ae83-b41835669130', 2, 1, NULL, 1, false, '2026-06-23 16:18:35.156228+00', '2026-06-24 05:34:16.622574+00'),
	('f4962b7b-fba5-404c-bc02-c2396d058e7a', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 3, 0, NULL, 1, false, '2026-06-23 09:35:02.279519+00', '2026-06-23 19:05:57.589674+00'),
	('29ea429a-eb79-46fc-a54a-a05ce880c96f', 'b30f1245-7316-4181-88c5-d2912822ed78', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 3, 0, NULL, 1, false, '2026-06-23 09:47:12.497831+00', '2026-06-23 19:05:57.589674+00'),
	('9d9eff8c-cfdd-4d09-b5f2-5f311c1b51e4', 'fd7ba2b0-fcc4-4753-95f8-24ffd76db33d', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 3, 0, NULL, 1, false, '2026-06-23 10:04:35.562942+00', '2026-06-23 19:05:57.589674+00'),
	('8f0f60e9-c0f9-445c-8002-418e10165723', 'd47244ae-6b64-4b0f-a9b9-1815a6328d01', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 2, 0, NULL, 1, false, '2026-06-23 10:37:43.217921+00', '2026-06-23 19:05:57.589674+00'),
	('95a53559-9eb3-4880-b6a9-95aefe822607', '4d4c23ec-b9a5-4269-ba62-c6b5b14b96f7', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 4, 1, NULL, 1, false, '2026-06-23 12:05:33.656063+00', '2026-06-23 19:05:57.589674+00'),
	('1e45dcd9-96f5-4b29-b93a-3cfcc48db262', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 4, 1, NULL, 1, false, '2026-06-23 13:16:36.080546+00', '2026-06-23 19:05:57.589674+00'),
	('2c30a653-c13c-4ec6-a51d-ff933e02fff6', '2daf29b4-112f-4832-be08-8e3c08d3fc91', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 3, 1, NULL, 1, false, '2026-06-23 15:20:38.24075+00', '2026-06-23 19:05:57.589674+00'),
	('5e285c2f-3715-4215-976f-8d674688dfd3', '0930660b-5514-44f7-8b77-0729bc2966c6', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 2, 1, NULL, 1, false, '2026-06-23 16:16:16.981391+00', '2026-06-23 19:05:57.589674+00'),
	('89be2ce8-2bca-4b5c-a0e6-70aff0f8b088', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 2, 0, NULL, 1, false, '2026-06-23 16:17:21.771792+00', '2026-06-23 19:05:57.589674+00'),
	('5ae7c655-246b-48e5-9a8d-108d92083ffc', '8fa00e77-689b-4f66-b327-4600e7617d3e', 'ad60c22e-ba41-4f33-85f4-8c370169e02e', 2, 0, NULL, 1, false, '2026-06-23 16:18:38.293437+00', '2026-06-23 19:05:57.589674+00'),
	('37e14b0c-af34-4d1b-951c-7b928939a160', '8fa00e77-689b-4f66-b327-4600e7617d3e', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 3, 0, NULL, 0, false, '2026-06-23 16:18:36.926231+00', '2026-06-23 22:01:39.941334+00'),
	('0485f565-1a59-4520-b9be-bf468106cdea', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'b2aaf7c9-e3e0-47fe-9be2-9d29e0824782', 2, 0, NULL, 0, false, '2026-06-23 17:55:09.936481+00', '2026-06-23 22:01:39.941334+00'),
	('c9224283-b194-4cb2-847e-3276dd71979d', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '97e9ab13-e5a8-4977-95da-0d176a85541b', 2, 1, NULL, 0, false, '2026-06-23 22:41:40.247793+00', '2026-06-23 22:41:40.247793+00'),
	('c8598d66-9d4d-456c-8cb5-7c2e66bf0aea', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-23 22:48:28.822439+00', '2026-06-23 22:48:28.822439+00'),
	('5600e0c3-a9dd-4eaa-aaf5-1ad212503301', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 3, 0, NULL, 0, false, '2026-06-23 22:48:43.507765+00', '2026-06-23 22:48:43.507765+00'),
	('b36a4353-e615-4c7f-9e54-99a1649ee83a', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 1, NULL, 0, false, '2026-06-23 22:49:16.584977+00', '2026-06-23 22:49:16.584977+00'),
	('3356e564-cd8d-4e06-90dc-834fbc06a8aa', '0930660b-5514-44f7-8b77-0729bc2966c6', 'a5f502c0-5cb4-42f2-ae30-aaa4c28a7585', 0, 2, NULL, 1, false, '2026-06-23 21:47:22.789755+00', '2026-06-24 05:33:46.60816+00'),
	('1d20a75c-dff7-468d-9a70-218ac9405495', '0930660b-5514-44f7-8b77-0729bc2966c6', '8c0619ea-3396-487d-ae83-b41835669130', 1, 1, NULL, 0, false, '2026-06-23 21:47:34.747898+00', '2026-06-24 05:34:16.622574+00'),
	('5b035fb7-cf65-4372-ad34-f0aaaf5df7d7', '2f150ca7-1e04-4ea2-9654-51e07553a5c6', '8c0619ea-3396-487d-ae83-b41835669130', 1, 0, NULL, 3, false, '2026-06-23 22:01:26.425006+00', '2026-06-24 05:34:16.622574+00'),
	('ff6660ee-b24b-4882-9114-9f5906c9407c', 'c2cd434b-c964-4093-acfa-924fae3e484e', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 3, 1, NULL, 0, false, '2026-06-24 05:52:06.428761+00', '2026-06-24 05:52:06.428761+00'),
	('3499b4f7-1ba8-4fc2-8f3c-fa50e422f05e', 'c2cd434b-c964-4093-acfa-924fae3e484e', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 4, 0, NULL, 0, false, '2026-06-24 05:52:22.477387+00', '2026-06-24 05:52:22.477387+00'),
	('50a56363-52c5-4bf6-b5e9-0a45b73bc878', 'c2cd434b-c964-4093-acfa-924fae3e484e', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 2, 2, NULL, 0, false, '2026-06-24 05:52:37.916837+00', '2026-06-24 05:52:37.916837+00'),
	('5741b95e-bb9e-49d3-b89d-2ddff89ec853', 'c2cd434b-c964-4093-acfa-924fae3e484e', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 0, 2, NULL, 0, false, '2026-06-24 05:52:49.81512+00', '2026-06-24 05:52:49.81512+00'),
	('c754dfbf-3478-48d0-a023-4e9ef6562d68', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '97e9ab13-e5a8-4977-95da-0d176a85541b', 1, 1, NULL, 0, false, '2026-06-24 08:28:34.788424+00', '2026-06-24 08:28:34.788424+00'),
	('2116ed6c-d26b-4e26-86d9-423454b9ad9b', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 0, NULL, 0, false, '2026-06-24 08:29:37.331943+00', '2026-06-24 08:29:37.331943+00'),
	('28e25a84-f866-4b20-a44e-c894a3e161e8', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 3, 1, NULL, 0, false, '2026-06-24 08:31:02.55534+00', '2026-06-24 08:31:02.55534+00'),
	('9cb7eb54-c643-4641-9471-cde3660e4d50', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 5, 0, NULL, 0, false, '2026-06-24 08:31:41.375244+00', '2026-06-24 08:31:41.375244+00'),
	('0c74d935-d610-480c-bbac-c41e7c0c2473', '884abf92-c836-4e02-bbd1-e373cdaa55cd', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 2, NULL, 0, false, '2026-06-24 08:33:03.455689+00', '2026-06-24 08:33:03.455689+00'),
	('4b17de56-237c-4b18-8f2a-1604e3f766d6', '884abf92-c836-4e02-bbd1-e373cdaa55cd', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 0, 2, NULL, 0, false, '2026-06-24 08:34:11.774322+00', '2026-06-24 08:34:11.774322+00'),
	('96a4e414-2d08-4069-bed4-c01748013940', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '97e9ab13-e5a8-4977-95da-0d176a85541b', 4, 2, NULL, 0, false, '2026-06-24 08:35:38.124805+00', '2026-06-24 08:35:38.124805+00'),
	('1cafa0a4-c77e-4a11-937c-b78b51d9b54b', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'ae0e8de9-9093-4951-956e-972a2c014017', 1, 0, NULL, 0, false, '2026-06-24 08:36:27.004662+00', '2026-06-24 08:36:27.004662+00'),
	('29fd1f88-65c3-4890-a855-115e1e44e252', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '9f901dcc-8ab1-4a08-9f04-b3602b369273', 3, 2, NULL, 0, false, '2026-06-24 08:37:07.856332+00', '2026-06-24 08:37:30.44952+00'),
	('413e6ec5-db5b-431d-8160-4b9b40edd53c', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '92d7d1c9-a6e8-473f-bec8-5568962c823a', 3, 0, NULL, 0, false, '2026-06-24 08:38:10.000153+00', '2026-06-24 08:38:10.000153+00'),
	('473eedb0-b646-4ef2-beb8-069fff1f496c', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', '900fc4e2-566b-426f-bbc1-cb627081fe7a', 1, 1, NULL, 0, false, '2026-06-24 08:38:36.987391+00', '2026-06-24 08:38:36.987391+00'),
	('a00d5888-2d6e-4bfb-acc7-8dedb812698f', 'f1edf59f-f325-48b6-a1ea-8c62e30cf4ad', 'dcc19d77-f944-49c2-98f2-45f9a2523dea', 0, 3, NULL, 0, false, '2026-06-24 08:39:07.228892+00', '2026-06-24 08:39:07.228892+00');


--
-- Data for Name: special_predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: third_place_combinations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 126, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict iujsR0e1gzVxrPb5FhMiC4T1eYRNofVKAnhgBgwxVb4qCSrpwPdUI1Zze8RbBDp

RESET ALL;
