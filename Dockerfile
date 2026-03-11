# Use official Node image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]