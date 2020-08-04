# MINIMAL DEV
FROM node:14.7.0-alpine as BASE_IMAGE
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
EXPOSE 3002

# BUILD
FROM BASE_IMAGE as BUILD_IMAGE
COPY . .
RUN yarn build \
	# yarn doesn't have a prune for production cause ??
	&& npm prune --production \
	&& yarn cache clean \
	&& yarn autoclean --force

# PROD
FROM node:14.7.0-alpine
WORKDIR /usr/app
COPY --from=BUILD_IMAGE /usr/app/src/dist ./src/dist
COPY --from=BUILD_IMAGE /usr/app/.env ./
COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "./dist/index.js"]