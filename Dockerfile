FROM node:lts

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
# RUN npm i -g pnpm
RUN NODE_ENV=development npm i

# Audit Packages
# RUN pnpm audit fix

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Create a non-root user
RUN useradd --create-home appuser
USER appuser

# Expose the port your app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]