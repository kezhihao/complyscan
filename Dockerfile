# ComplyScan Development Container
# For local testing and development

FROM node:20-alpine

WORKDIR /app

# Install wrangler globally
RUN npm install -g wrangler

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 8787

# Default command
CMD ["npm", "run", "dev"]
