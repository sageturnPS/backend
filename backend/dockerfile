# Use an official Node.js runtime as a parent image
FROM node:lts-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install project dependencies using pnpm
RUN pnpm install --only=production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the application
CMD ["pnpm", "start:docker"]