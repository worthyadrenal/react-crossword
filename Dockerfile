# Step 1: Build the React app
FROM node:18 AS build

WORKDIR /app
COPY . .

# Install dependencies and build
RUN yarn install
RUN yarn build

# Step 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
