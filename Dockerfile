FROM madnificent/ember:6.4.0 AS builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY .npmrc .
COPY package.json package-lock.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci
COPY . .

RUN ember build -prod

FROM semtech/static-file-service:0.2.0


ENV EMBER_ENABLE_IMPERSONATION=""
ENV EMBER_ENABLE_DEBUG=""
ENV EMBER_DISABLE_SESSION_POLLING=""

COPY ./proxy/compression.conf /config/compression.conf
COPY ./proxy/file-upload.conf /config/file-upload.conf
COPY ./proxy/file-download.conf /config/file-download.conf

COPY --from=builder /app/dist /data
