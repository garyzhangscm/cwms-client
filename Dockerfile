
FROM nginx:stable-alpine3.20-perl 

COPY ./nginx.default.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY ./dist/ng-alain-v19-without-ssr/browser/ /usr/share/nginx/html/

RUN chown nginx:nginx /usr/share/nginx/html/*

CMD [ "nginx", "-g", "daemon off;"]
