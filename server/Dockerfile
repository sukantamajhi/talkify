# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json first to leverage Docker cache
COPY . ./

# Install only production dependencies (since this will be a production build)
RUN npm install

# Build the application (if applicable)
RUN npm run build

# Expose the port the backend app runs on (default for Express)
EXPOSE 5000

# Start the Node.js app
CMD ["npm", "run", "start"]
