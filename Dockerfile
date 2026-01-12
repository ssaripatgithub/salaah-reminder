FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure correct timezone (PH)
ENV TZ=Asia/Manila

CMD ["node", "src/index.js"]
