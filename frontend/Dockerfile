# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend code (optional for initial build, volumes will override during dev)
COPY . .

# Expose port 3000
EXPOSE 3000

# Use environment variable to differentiate dev / prod
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Use CMD for development with live reload
# React development server auto-reloads on code change
CMD ["npm", "start"]
