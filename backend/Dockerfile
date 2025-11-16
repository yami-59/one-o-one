# /backend/Dockerfile

# 1. Image de base : Utilise une version officielle de Python
FROM python:3.11-slim

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copier les fichiers de configuration et d'environnement (avant tout le reste)
# Cela permet à Docker de mettre cette étape en cache (cache layer)
COPY requirements.txt .

# 4. Installer les dépendances
# --no-cache-dir : réduit la taille finale de l'image
# L'installation se fait directement dans l'environnement Python du conteneur
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copier tout le reste du code de l'application
# (Les dossiers app/, main.py, etc.)
COPY . .

# 6. Commande par défaut lors du démarrage du conteneur , démarrage de l'api principale
CMD ["uvicorn", "app.api_main:app", "--host", "0.0.0.0", "--port", "8000"]
#Autre Commande par défaut possible ,démarrage du game_engine 
#CMD ["uvicorn", "app.game_engine:app", "--host", "0.0.0.0", "--port", "8000"]