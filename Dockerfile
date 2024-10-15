# syntax=docker/dockerfile:1

FROM felddy/foundryvtt

RUN rm -rf /data/*
RUN apk add unzip

COPY FoundryData.zip /tmp/FoundryData.zip
RUN unzip /tmp/FoundryData.zip -d /data/
COPY foundryvtt-12.331.zip /data/container_cache/foundryvtt-12.331.zip
# COPY ./dist /data/Data/modules/stage-manager
