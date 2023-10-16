FROM madnificent/ember:3.28.5 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY .npmrc .
COPY package.json .
RUN CYPRESS_INSTALL_BINARY=0 npm install
COPY . .

RUN ember build -prod

FROM semtech/static-file-service:0.2.0

ENV EMBER_ENABLE_DECISION_GOEDGEKEURD=""
ENV EMBER_ENABLE_SIGNATURES=""
ENV EMBER_ENABLE_IMPERSONATION=""
ENV EMBER_ENABLE_DEBUG=""
ENV EMBER_ENABLE_DIGITAL_AGENDA=""
ENV EMBER_ENABLE_DIGITAL_MINUTES=""

COPY ./proxy/compression.conf /config/compression.conf
COPY ./proxy/file-upload.conf /config/file-upload.conf
COPY ./proxy/file-download.conf /config/file-download.conf

COPY --from=builder /app/dist /data
