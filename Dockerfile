# MINIMAL DEV
FROM node:14.7.0-alpine as base-stage
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
EXPOSE 3002

# BUILD
FROM base-stage as build-stage
COPY . .
RUN yarn build \
	# yarn doesn't have a prune for production cause ??
	&& npm prune --production \
	&& yarn cache clean \
	&& yarn autoclean --force

# PROD
FROM node:14.7.0-alpine as production-stage
WORKDIR /usr/app
COPY --from=build-stage /usr/app/dist ./dist
COPY --from=build-stage /usr/app/.env ./
COPY --from=build-stage /usr/app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "./dist/index.js"]