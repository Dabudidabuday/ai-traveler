FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build both client and server
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"] 
