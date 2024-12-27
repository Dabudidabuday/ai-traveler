FROM node:18-slim

WORKDIR /app

# Install required dependencies for building
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm ci

# Install client dependencies and build tools globally
RUN cd client && \
    npm ci && \
    npm install -g typescript vite

# Install server dependencies
RUN cd server && npm ci

# Copy source code
COPY . .

# Build client
RUN cd client && \
    NODE_ENV=production npm run build

# Build server
RUN cd server && npm run build

# Expose port
EXPOSE 3000

# Start the server in production mode
CMD ["npm", "start"] 
