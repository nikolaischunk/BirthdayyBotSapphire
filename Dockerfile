# ================ #
#    Base Stage    #
# ================ #

FROM node:22-alpine AS base

WORKDIR /usr/src/app

ENV YARN_DISABLE_GIT_HOOKS=1
ENV CI=true

# Required for Sapphire to run
RUN apk add --no-cache dumb-init python3 g++ make

# Install Doppler CLI ❗ Dont suppress output
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && \ apt-get -y install doppler \ apt-get clean

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base AS builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node src/ src/
COPY --chown=node:node ./prisma ./prisma

RUN yarn install --immutable
RUN yarn dlx prisma generate
RUN yarn run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --chown=node:node --from=builder /usr/src/app/dist dist
COPY --chown=node:node --from=builder /usr/src/app//prisma ./prisma
COPY --chown=node:node --from=builder /usr/src/app/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --chown=node:node --from=builder /usr/src/app/node_modules/.prisma/client/ ./node_modules/.prisma/client/


RUN yarn workspaces focus --all --production
RUN chown node:node /usr/src/app/

USER node

CMD [ "yarn", "run", "start" ]
