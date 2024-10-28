# Install dependencies only when needed
FROM node:18-alpine3.15 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
# Equivalent to yarn install --frozen-lockfile
RUN npm ci 


# Build the app with cache dependencies
FROM node:18-alpine3.15 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


# Production image, copy all the files and run next
FROM node:20-bookworm AS runner
RUN apt update && apt install apt-transport-https lsb-release ca-certificates -y htop nano
RUN npx -y playwright@1.45.1 install --with-deps
# Configura la zona horaria
ENV TZ=America/Lima
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Use deps as final stage
FROM runner AS final
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev
# Expone el puerto que usa NestJS
EXPOSE 3500

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "start:prod"]
