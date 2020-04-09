FROM nginx:1.17.1-alpine
COPY /dist/cwms /usr/share/nginx/html
COPY /nginx.default.conf /ect/nginx/conf.d/default.conf