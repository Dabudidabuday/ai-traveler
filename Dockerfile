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

# Clean install dependencies
RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci
# Copy source code
COPY . .

# Build client with specific platform
# RUN cd client && \
#     npm rebuild rollup && \
#     npm run build

# Build server
# RUN cd server && npm run build

RUN cd client && npm run dev
RUN cd server && npm run dev

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 
