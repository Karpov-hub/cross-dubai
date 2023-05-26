FROM mhart/alpine-node:12 As build

WORKDIR /app
ENV NODE_ENV=production

COPY package.json /app/package.json

COPY admin /app/admin
COPY admin/package.json /app/admin/package.json

COPY packages /app/packages

RUN yarn --ignore-scripts --production --no-optional

FROM mhart/alpine-node:slim-12
COPY --from=build /app /app
WORKDIR /app

CMD ["node", "/app/admin/server.js"]