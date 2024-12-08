FROM nginx:alpine

COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template

RUN apk update && apk add gettext

ARG ADMIN_DOMAIN
ENV ADMIN_DOMAIN=${ADMIN_DOMAIN}

ARG HOME_DOMAIN
ENV HOME_DOMAIN=${HOME_DOMAIN}

RUN envsubst '${ADMIN_DOMAIN} ${HOME_DOMAIN}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/nginx.conf.template

# Cung cấp cổng 80 để truy cập ứng dụng
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]