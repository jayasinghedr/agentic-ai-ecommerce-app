FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["sh", "-c", "DATABASE_URL=file:/app/data/dev.db npx prisma migrate deploy && DATABASE_URL=file:/app/data/dev.db npm run seed && node dist/app.js"]
