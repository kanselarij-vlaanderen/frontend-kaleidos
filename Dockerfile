FROM madnificent/ember:3.28.5 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json .
COPY .npmrc .
RUN CYPRESS_INSTALL_BINARY=0 npm install
COPY . .

RUN ember build -prod

FROM semtech/ember-proxy-service:1.5.1

ENV STATIC_FOLDERS_REGEX="^/(assets|fonts|files|ember-pdfjs-wrapper)/"
ENV EMBER_ENABLE_PUBLICATIONS_TAB=""
ENV EMBER_ENABLE_SIGNATURES=""

COPY ./proxy/torii-authorization.conf /config/torii-authorization.conf
COPY ./proxy/file-upload.conf /config/file-upload.conf
COPY ./proxy/file-download.conf /config/file-download.conf

COPY --from=builder /app/dist /app
