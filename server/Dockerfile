FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libxfixes3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libatk1.0-0 \
    libdrm2 \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install

RUN npx playwright install chromium

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
