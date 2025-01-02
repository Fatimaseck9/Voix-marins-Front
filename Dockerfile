# # Étape 1 : Construction de l'application Angular
# # Utilisez une image node pour construire l'application
# FROM node:18.20.2-slim AS build
 
# # Set to a non-root built-in user `node`
# USER node
 
# # Create app directory (with user `node`)
# RUN mkdir -p /home/node/app
 
# # Définir le répertoire de travail dans le conteneur
# WORKDIR /home/node/app
 
# # Copier les fichiers package.json et package-lock.json
# COPY --chown=node package*.json ./
 
# # Installer les dépendances de l'application
# RUN npm install
 
# # Copier le reste des fichiers du projet Angular dans le conteneur
# COPY --chown=node . .
 
# # Construire l'application pour la production
# RUN npm run build --prod
 
# # Étape 2 : Configuration de Nginx pour servir l'application
# # Utilisez une image Nginx pour servir le contenu
# FROM nginx:alpine
 
# # Copier les fichiers générés dans le répertoire de build vers le dossier par défaut de Nginx
# COPY --from=build /home/node/app/dist/demo /usr/share/nginx/html
 
# # Copier le fichier de configuration personnalisé de Nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# # Exposer le port sur lequel Nginx est en écoute
# EXPOSE 80
 
# # Commande pour démarrer Nginx
# CMD ["nginx", "-g", "daemon off;"]
# -----------------------------------------------------
# -----------------------------------------------------
 
# Étape 1 : Utiliser une image Nginx pour servir l'application
FROM nginx:alpine
 
# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/share/nginx/html
 
# Supprimer les fichiers par défaut de Nginx (index.html)
RUN rm -rf ./*
 
# Copier le répertoire 'dist' généré localement dans le conteneur
COPY dist/demo/ .
 
# Copier le fichier de configuration personnalisé de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Exposer le port sur lequel Nginx écoute
EXPOSE 80
 
# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]