#https://blog.diogomonica.com/2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/

FROM oven/bun:alpine AS builder
WORKDIR /usr/local/src/app
# Install ALL dependencies (including devDependencies for build)
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
RUN bun run build:production
# Now install ONLY production dependencies for final image
RUN rm -rf node_modules \
    && bun install --production --frozen-lockfile

FROM oven/bun:alpine AS final
WORKDIR /usr/local/src/app

RUN addgroup -S bun || true && adduser -S bun -G bun || true

# Copy built application và tạo thư mục với quyền phù hợp
COPY --from=builder /usr/local/src/app/node_modules ./node_modules
COPY --from=builder /usr/local/src/app/package.json ./package.json
COPY --from=builder /usr/local/src/app/dist ./dist
COPY --from=builder /usr/local/src/app/generated ./generated
COPY --from=builder /usr/local/src/app/prisma ./prisma

RUN mkdir -p /usr/local/src/app/logs && chown -R bun:bun /usr/local/src/app && chmod -R 755 /usr/local/src/app
USER bun

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bun dist/index.js"]