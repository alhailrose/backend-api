FROM node:20.17.0
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD ["npm", "start"]
