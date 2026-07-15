FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build_client
RUN npm run build_server

EXPOSE 3000

CMD ["npm", "start"]