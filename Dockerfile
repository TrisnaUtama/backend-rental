FROM oven/bun

WORKDIR /app

COPY ./package.json bun.lock ./
COPY ./prisma .

RUN bun install --ignore-scripts
RUN bunx prisma generate

COPY . .

EXPOSE 8000

CMD ["sh", "-c" , "bunx prisma db push && bun run ./src/index.ts"]