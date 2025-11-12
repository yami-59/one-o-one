🧩 One-o-One — FastAPI + React + Chakra Starter

Un environnement minimal mais 100 % fonctionnel, permettant à toute l’équipe de lancer rapidement le projet et commencer le développement.

🚀 1. Démarrage rapide avec Docker (recommandé)
🔧 Prérequis

Docker Desktop installé et en cours d’exécution (mode WSL 2 activé).

Docker Compose inclus dans Docker Desktop.

▶️ Commandes à exécuter
# Cloner le dépôt
git clone https://github.com/<votre_repo>/one-o-one.git
cd one-o-one

# (optionnel) Copier les variables d’environnement
cp .env.example .env

# Construire et démarrer
docker compose up --build

🌐 Accès
Service	URL	Description
Frontend	http://localhost:5173
	Interface React + Chakra
Backend	http://localhost:8000/api/hello
	API FastAPI
Health	http://localhost:8000/api/health
	Vérification du backend

➡️ Dès que ces URLs répondent, ton environnement fonctionne.
Tu peux alors commencer à coder directement dans frontend/src/ ou backend/.

💻 2. Démarrage sans Docker (en local)
🐍 Backend (FastAPI)
cd backend
python -m venv .venv
# Windows :
.\.venv\Scripts\activate
# Mac/Linux :
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000


➡️ http://localhost:8000/api/hello
 doit afficher :

{"message": "Hello World from FastAPI 👋"}

⚛️ Frontend (React + Chakra)
cd frontend
npm install
npm run dev


➡️ http://localhost:5173
 doit afficher :

Hello World from React + Chakra 👋

🧱 3. Structure du projet
one-o-one/
├── docker-compose.yml           # Lancement complet (frontend + backend)
├── .env.example                 # Variables d'environnement
├── README.md                    # Ce guide 🙂
│
├── backend/                     # 💾 FastAPI
│   ├── main.py                  # Point d’entrée
│   ├── requirements.txt         # Dépendances
│   └── Dockerfile
│
└── frontend/                    # 🎨 React + Chakra + Vite
    ├── src/
    │   ├── App.jsx              # Page principale
    │   └── main.jsx             # Entrée de l’application
    ├── package.json
    ├── vite.config.js
    └── Dockerfile

🌿 4. Git workflow de l’équipe

main → version stable, déployable.

dev → branche de développement principale.

feat/… → nouvelles fonctionnalités.

Exemple
# Récupérer la dernière version
git pull origin dev

# Créer ta branche de travail
git checkout -b feat/game-room

# Travailler, commit, push
git add .
git commit -m "feat: add game room layout"
git push origin feat/game-room


➡️ Une fois validé, ouvre une Pull Request vers dev.
Les règles détaillées sont dans README_GIT_WORKFLOW.md.

🧰 5. Dépannage Docker

Si tu vois ce type d’erreur :

open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified


➡️ Cela signifie que Docker Desktop n’est pas démarré.

Ouvre Docker Desktop depuis le menu démarrer.

Vérifie que le logo 🐳 indique “Running”.

Relance :

docker compose down --remove-orphans
docker compose up --build

👩‍💻 6. Pour commencer le développement

Ouvre le projet dans VS Code.

Lancer le backend ou Docker.

Lancer le frontend :

npm run dev


Commence à coder dans frontend/src/components/ ou backend/.

🧠 7. Ressources utiles

FastAPI Docs

Chakra UI Docs

Vite

Docker Desktop pour Windows

🟢 En résumé

Clone → docker compose up --build → Frontend (5173) + Backend (8000) → prêt à coder 🚀