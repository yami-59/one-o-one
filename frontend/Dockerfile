# /frontend/Dockerfile (Production Ready)

# -----------------------------------------------------------
# STAGE 1: BUILDER (Compilation des assets React/Vite)
# -----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /frontend

# 1. Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# 2. Installer toutes les dépendances (y compris les devDependencies)
RUN npm ci

# 3. Copier le code source
COPY . .

# 5. Exécuter le build de production de Vite
RUN npm run build


# -----------------------------------------------------------
# STAGE 2: FINAL (Serveur Nginx Léger)
# -----------------------------------------------------------
FROM nginx:alpine

# 1. Supprimer la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# 2. Copier notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# 3. Copier les fichiers statiques COMPILÉS depuis le STAGE 1
COPY --from=builder /frontend/dist /usr/share/nginx/html

# 4. Créer une page d'erreur 50x basique
RUN echo '<!DOCTYPE html><html><head><title>Erreur</title></head><body><h1>Service temporairement indisponible</h1></body></html>' > /usr/share/nginx/html/50x.html

# 5. Exposer le port 80
EXPOSE 80

# 6. Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# 7. Commande par défaut
CMD ["nginx", "-g", "daemon off;"]