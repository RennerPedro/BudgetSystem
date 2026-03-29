FROM node:18-bullseye

WORKDIR /app

# Install dependencies for the API workspace
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Source is mounted by docker-compose for live reload in dev
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
