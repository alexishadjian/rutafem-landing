# Use the official Node.js image from the Docker Hub
FROM node:22

# Create and change to the app directory
WORKDIR /home/node/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY ./src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY ./src/ ./src/

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["npm", "run", "dev"]