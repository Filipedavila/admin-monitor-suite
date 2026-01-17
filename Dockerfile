FROM node:20-alpine AS base 
WORKDIR /app
COPY package*.json ./

COPY ama-design-system* ./ 
RUN npm ci

FROM base AS development

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS builder

COPY . .
RUN npm run build:noenv

FROM httpd:alpine AS production

RUN sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/' /usr/local/apache2/conf/httpd.conf
WORKDIR /usr/local/apache2/htdocs/ams

COPY --from=builder /app/dist /usr/local/apache2/htdocs/ams

COPY --from=builder /app/.htaccess /usr/local/apache2/htdocs/ams

EXPOSE 80