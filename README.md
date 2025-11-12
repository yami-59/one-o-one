# 🚀 Plan de Développement : One'o One

Ce plan structure le développement pour garantir la livraison rapide du **Minimum Viable Product (MVP)** : un jeu jouable en temps réel.

---

## 🎯 Phase 1 : Le Cœur de Produit (MVP)

La priorité absolue est de prouver que le jeu fonctionne en temps réel.

### 1. 🐍 Implémentation du Backend (FastAPI & DB)

Mettre en place la fondation de l'API REST et du stockage principal.

* **Configuration de Base :** Initialisation du projet, configuration de **FastAPI**, de `uvicorn`, et du fichier `settings.py`.
* **Base de Données Principale (PostgreSQL/SQLModel) :** Définition des modèles de base de données critiques : **`User`** et **`GameSession`** (pour stocker qui joue contre qui, et l'identifiant de partie `game_id`).

### 2. 🔌 Implémentation du WebSocket (Temps Réel)

Le cœur de la communication et de la logique de jeu.

* **Point d'Entrée WebSocket :** Création du `websocket_endpoint` (ex: `/ws/game/{game_id}`) pour accepter les connexions.
* **Gestion du "Game State" :** Mise en place des fonctions pour lire et écrire l'état de la partie dans **Redis** (la position des pièces, le tour du joueur, le score temporaire).

### 3. 🕹️ Implémentation du Jeu (Frontend & Logique)

Créer le premier jeu simple et l'interface utilisateur.

* **Logique de Jeu Python :** Coder les fonctions Python qui définissent les **règles du jeu** (`process_game_move`, `check_win_condition`) dans le backend.
* **Interface Joueur (React) :** Création du composant `GameRoomComponent` pour afficher l'interface du jeu.
* **Communication :** Implémentation du code JavaScript/React pour ouvrir la connexion WebSocket, envoyer les actions du joueur au backend, et mettre à jour l'UI en fonction des messages reçus.

---

## 🥈 Phase 2 : Fonctionnalités Essentielles

Une fois le jeu jouable, ajouter les systèmes de base pour la gestion des utilisateurs et le cycle de vie des parties.

### 4. 🔑 Authentification (Passwordless/OTP)

Mise en place de la connexion sécurisée.

* **Endpoints OTP :** Implémentation des routes `request-code` et `verify-code` (Étapes 1 et 2 du flux).
* **Génération et Validation JWT :** Utilisation de `python-jose` pour créer et valider le jeton de session (JWT).
* **Service E-mail :** Intégration d'une librairie Python (comme `fastapi-mail`) pour l'envoi du code OTP.
* **Matchmaking de Base :** Création d'un service minimal pour mettre deux joueurs en attente et les assigner à un `game_id` valide.

### 5. 🏆 Classement (Ranking)

Afficher la progression des joueurs.

* **Mise à jour du Score :** Au niveau du backend, implémenter la logique pour mettre à jour les scores dans la base de données après la fin d'une partie.
* **Classement en Temps Réel (Redis Sorted Sets) :** Mettre en place la structure **Sorted Sets** dans Redis pour maintenir un classement des meilleurs joueurs mis à jour de manière instantanée.
* **Endpoint API :** Création de la route `GET /api/v1/ranking` pour que le frontend affiche le classement.

---

## 🥉 Phase 3 : Améliorations et Fonctionnalités Sociales

Fonctionnalités améliorant l'expérience et l'engagement.

* **Ajout d'Amis/Invitation :** Système pour que les utilisateurs puissent s'envoyer des invitations à jouer via le backend.
* **Historique des Parties :** Création d'une route pour consulter l'historique complet des parties d'un utilisateur, stocké dans PostgreSQL.
* **Améliorations UI/UX :** Refonte des styles, animations et transitions (Frontend).
* **Ajout d'Autres Jeux Simples :** Expansion de la logique de jeu pour inclure d'autres jeux (Quiz, Puissance 4, etc.).



---



# 🛡️ Authentification sans Mot de Passe (Magic Code/OTP)

Cette application utilise un système d'authentification moderne sans mot de passe basé sur des codes à usage unique (OTP) envoyés par email. Ce système améliore la sécurité (pas de stockage de mot de passe) et l'expérience utilisateur.


## 🚀 Flux d'Authentification Détaillé

Le processus se déroule en trois étapes principales, orchestrées par deux endpoints REST critiques :

### 1. 📬 Étape 1 : Demande du Code (Request OTP)

Cette étape initialise la session de connexion en demandant un code temporaire.

* **Endpoint FastAPI :** `POST /api/v1/auth/request-code`

| Composant | Rôle dans le Backend (FastAPI) |
| :--- | :--- |
| **Pydantic** | Valide que le **format de l'email** est correct. |
| **Génération** | Génère un **Code OTP aléatoire** (ex: 6 chiffres). |
| **POSTGRESQL** | **Stocke** la paire `(email: code)` avec une **Durée de Vie (TTL)** courte (ex: 5 minutes) pour l'empêcher d'être réutilisé ou d'expirer. |
| **E-mailing** | Envoie l'e-mail contenant le code OTP au client. |
| **Réponse HTTP** | Retourne une réponse **202 Accepted** (Accepté) au frontend. |

### 2. 🔑 Étape 2 : Vérification du Code (Verify OTP)

Le client utilise le code reçu pour prouver son identité.

* **Endpoint FastAPI :** `POST /api/v1/auth/verify-code`

| Composant | Rôle dans le Backend (FastAPI) |
| :--- | :--- |
| **Pydantic** | Reçoit et valide l'objet `EmailVerification(email: str, code: str)`. |
| **POSTGRESQL** | **Vérifie** l'existence et la validité du code dans le cache. |
| **Nettoyage** | **Supprime** le code de Redis immédiatement après utilisation pour garantir qu'il est à usage unique. |
| **`python-jose`** | Si la vérification est réussie, **Génère un JWT (JSON Web Token)** contenant l'identité de l'utilisateur. |
| **Réponse HTTP** | Retourne le JWT (le jeton de session) au frontend. |

### 3. 🛡️ Étape 3 : Sessions Futures (Authentification par JWT)

Après la vérification, l'utilisateur est considéré comme authentifié tant que son jeton de session est valide.

* **Rôle du Client (React) :** Stocke le JWT et l'ajoute à l'en-tête `Authorization` de **toutes les requêtes futures** vers les routes protégées (ex: `/api/v1/ranking`).
* **Rôle du Backend (FastAPI) :** Le système de **Dépendances** (`Depends`) intercepte le jeton, utilise `python-jose` pour le décoder, vérifie sa signature et sa date d'expiration pour autoriser ou rejeter l'accès à la ressource demandée.



