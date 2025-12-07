# /backend/Dockerfile (Optimisé pour la Production)

# -----------------------------------------------------------
# STAGE 1: BUILDER (Construction des dépendances)
# -----------------------------------------------------------
FROM python:3.11-slim AS builder

# Définir le répertoire de travail
WORKDIR /install

# 1. Copier uniquement les fichiers nécessaires pour l'installation
COPY requirements.txt .

# 2. Installer les dépendances dans un emplacement temporaire
# Le flag --no-cache-dir réduit la taille, et --upgrade pour s'assurer des dernières versions
RUN pip install --no-cache-dir --user -r requirements.txt


# -----------------------------------------------------------
# STAGE 2: FINAL (Image d'exécution minimale)
# -----------------------------------------------------------
# Utiliser une image Python encore plus petite pour l'exécution finale (moins de librairies OS)
FROM python:3.11-slim

# Définir les variables d'environnement de Python pour l'exécution
ENV PYTHONUNBUFFERED=1
ENV PATH="/root/.local/bin:${PATH}"

# 1. Copier les dépendances installées du Stage 1 (Seules les librairies)
# Le --from=builder récupère le dossier d'installation des dépendances
COPY --from=builder /root/.local /root/.local 

# 2. Copier le code source de l'application (Dossier 'app')
WORKDIR /app
COPY app /app/app
# Si vous avez des fichiers de configuration non-Python (comme alembic.ini), copiez-les aussi
COPY alembic.ini .

# 3. Commande par défaut lors du démarrage du conteneur (API principale)
# Ne pas utiliser --reload en production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]