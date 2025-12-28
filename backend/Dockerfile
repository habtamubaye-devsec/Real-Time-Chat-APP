# Base image
FROM node:20-alpine AS build

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Use a smaller runtime image
FROM node:20-alpine

WORKDIR /app

# Copy build artifacts and dependencies from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
