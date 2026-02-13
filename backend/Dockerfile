# Dockerfile pour le serveur APP (NestJS)
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Stage de production
FROM node:18-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main"]

