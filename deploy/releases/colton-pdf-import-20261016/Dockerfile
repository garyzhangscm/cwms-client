FROM brianwang1912/mes-web@sha256:30b56b650f79755498b2dfdbd1c5654100c91aed31a94db614aace522f69896a
RUN rm -rf /usr/share/nginx/html/*
COPY mime.types /etc/nginx/mime.types
COPY html/ /usr/share/nginx/html/
