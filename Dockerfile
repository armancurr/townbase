FROM oven/bun:1 AS builder

WORKDIR /app

ENV HUSKY=0

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=${VITE_CONVEX_URL}

RUN bun run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
