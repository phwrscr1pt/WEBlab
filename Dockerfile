FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY database ./database

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]
