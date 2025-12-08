# /frontend/Dockerfile (Production Ready)

# -----------------------------------------------------------
# STAGE 1: BUILDER (Compilation des assets React/Vite)
# -----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copier les fichiers de dépendances
COPY package.json package-lock.json ./ 

# 2. Installer toutes les dépendances (y compris les devDependencies)
# Le flag --production=false est nécessaire pour installer les outils de build
RUN npm install 

# 3. Copier le code source
COPY . .

# 4. Exécuter le build de production de Vite
# Ceci génère les fichiers statiques (HTML, CSS, JS) dans le dossier /dist
RUN npm run build


# -----------------------------------------------------------
# STAGE 2: FINAL (Serveur Nginx Léger)
# -----------------------------------------------------------
# Utiliser Nginx pour servir les fichiers statiques (image extrêmement petite et rapide)
FROM nginx:alpine

# 1. Copier le fichier de configuration Nginx personnalisé (si nécessaire)
# Sinon, Nginx utilise sa configuration par défaut.
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copier les fichiers statiques COMPILÉS depuis le STAGE 1
# '—from=builder' indique à Docker de chercher dans le premier stage
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. Commande par défaut (Nginx est configuré pour écouter en HTTP)
CMD ["nginx", "-g", "daemon off;"]