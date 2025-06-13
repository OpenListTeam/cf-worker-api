# OpenList API Token Generator

## Init

```bash
pnpm install
pnpm --prefix=web install
```

## Development

Change [wrangler.toml](./wrangler.toml) environment variables.

Frontend development server:

```bash
cd web && pnpm dev
```

Wrangler backend development server:

```bash
pnpm dev
```

Add or modify routes in [src/drivers](./src/drivers).

Then modify [src/routes.ts](./src/routes.ts) and [web/collection.ts](./web/collection.ts).

## Production & Deployment

Build the frontend:

```bash
pnpm run build:prod
```

Deploy the backend:

```bash
pnpm run deploy
```

## License

The code of this project is licensed under the [AGPL 3.0](LICENSE) license.
