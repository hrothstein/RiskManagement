FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

WORKDIR /app

EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production

CMD ["node", "server/index.js"]

