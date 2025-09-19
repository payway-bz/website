FROM node:20-bookworm AS base
WORKDIR /app

# Install pnpm globally in the base image
RUN npm install -g pnpm


FROM base AS make-lockfile
COPY ./package.json ./
RUN pnpm install


FROM base AS build

# Copy all mandatory files for builds.
COPY ./package.json \
     ./pnpm-lock.yaml \
     ./tsconfig.json \
     ./vite.config.ts \
     ./postcss.config.js \
     ./tailwind.config.js \
     ./index.html \
     ./
COPY ./src ./src
#COPY ./public ./public

RUN pnpm install --frozen-lockfile
RUN pnpm run build


FROM build AS dev

CMD ["pnpm", "run", "dev"]


FROM bitnami/nginx:1.27 AS prod

# Copy static assets from builder stage
COPY --from=build /app/dist /app

FROM scratch AS export

COPY --from=build /app/dist/ /dist/
