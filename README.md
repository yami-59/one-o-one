# One'o One — MVP

> Une plateforme de jeux compétitifs en temps réel.

## Installation & Lancement rapide

### 1. Prérequis
- Docker installé
- Docker Compose installé

### 2. Démarrer le projet

Cloner le dépôt :
```bash
git clone https://github.com/yami-59/one-o-one.git
cd one-o-one
```
### 3. Lancer tous les services
```bash
docker-compose up --build
```
### 4. Ouvrir dans le navigateur
http://localhost:8080/lobby

### 5. Arrêter le projet
 ```bash
docker-compose down
```

## Le Cœur de Produit 

La priorité absolue de cette version est de fournir une infrastructure robuste capable de gérer des **matchs multijoueurs en temps réel** avec une latence minimale.

---

## 1. Authentification & Sessions

Pour ce MVP, l'accès est simplifié afin de favoriser l'engagement immédiat :

* **Accès Invité :** Le seul mode disponible actuellement. Cliquez sur `Connexion` -> `Jouer en tant qu'invité`.
* **Gestion des données :** Les informations de session sont stockées dans le navigateur via un **JWT (JSON Web Token)** sécurisé.
* **Protocole de Test :** Pour tester les fonctionnalités multijoueurs sur une seule machine, ouvrez deux navigateurs différents (ex: Chrome et Edge) ou utilisez un onglet de navigation privée.

---

## 2. Le Jeu : Mots Mêlés

Bien que l'architecture soit modulaire et conçue pour supporter une grande variété de mini-jeux, ce MVP inaugure la plateforme avec le jeu de **Mots Mêlés**.

### Paramètres de la partie
| Paramètre | Valeur |
| :--- | :--- |
| **Taille de la grille** | 10 x 10 |
| **Limite de temps** | 5 minutes |
| **Système de points** | +10 points par mot trouvé |



### Conditions de Victoire & Fin de match
La partie se termine instantanément si :
1.   **Chrono :** Le temps imparti est écoulé.
2.   **Complétion :** Tous les mots de la grille ont été découverts.
3.   **Abandon :** Un joueur quitte la page ou se déconnecte volontairement.

### Chat en temps réel
Pendant la partie, les joueurs peuvent désormais communiquer en direct via une fenêtre de chat intégrée. Cela permet d'échanger des messages instantanément sans quitter l'interface de jeu.

---

## Stack Technique

* **Frontend :** React (Vite.js) & Tailwind CSS.
* **Backend :** FastAPI (Python 3.12).
* **Temps Réel :** WebSockets & Redis (Pub/Sub).
* **Base de données :** PostgreSQL (SQLModel).
* **Conteneurisation :** Docker & Docker Compose.

---









