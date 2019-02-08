FROM nginx:1.9.12

ARG EMBER_ENV=development
ENV VIRTUAL_HOST=kaleidos-dev.kanselarij-dev.s.redpencil.io

RUN apt-get update \
	&& apt-get install -y curl git bzip2 libfontconfig1-dev xz-utils


ENV NPM_CONFIG_LOGLEVEL info

ENV NODE_VERSION 10.8.0

ADD package.json /tmp/client/

RUN cd /tmp/client
ADD . /tmp/client
RUN mv dist/* /usr/share/nginx/html/ && rm -rf /tmp/client
ADD nginx.conf /etc/nginx/conf.d/default.conf

CMD /bin/bash -c "nginx -g 'daemon off;'"
