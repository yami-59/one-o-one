FROM node:20-slim
WORKDIR /app
COPY package.json vite.config.js index.html ./
COPY src ./src
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
