# nestjs-starter-template

A production-shaped NestJS starter: layered architecture, TypeORM + Postgres, RabbitMQ worker with dead-letter queues, JWT + API-key auth, structured logging, and **end-to-end distributed tracing via OpenTelemetry → OTel Collector → Tempo → Grafana**.

This branch (`tracing-collector`) adds the observability stack on top of the API/worker foundation.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [Observability](#observability)
- [Messaging](#messaging)
- [Auth](#auth)
- [Database & migrations](#database--migrations)
- [Conventions](#conventions)
- [API surface](#api-surface)
- [Scripts](#scripts)
- [Known gaps](#known-gaps)

---

## Architecture

Three independent entrypoints share one module graph:

| Entrypoint | File | What it is |
|---|---|---|
| API | `src/entry/api/app.ts` | HTTP server (Express), Swagger, global validation, CORS, port `3000` |
| Worker | `src/entry/worker/app.ts` | RabbitMQ consumer — one microservice listener per routing key, port `3001` |
| REPL | `src/entry/repl/app.ts` | NestJS REPL against `AppModule` for poking at providers |

Layering:

```
src/
├── core/       domain — entities, modules, use cases (commands/queries/tasks)
├── infra/      adapters — db, repositories, rabbitmq, logger, tracing, guards, filters
├── shared/     cross-cutting — config, errors, decorators, DTO "packs", utils
└── entry/      composition roots — api | worker | repl
```

Domain code depends on **interfaces** (`IUserRepository`, `ILogger`, `INotificationService`), bound to concrete infra classes via string tokens in each module's `providers`. Swapping TypeORM for something else means touching `infra/repositories` only.

Request flow, end to end:

```
HTTP → Guard (JWT / API key) → ValidationPipe → Controller
     → Command/Query (business logic, custom spans)
     → Repository (TypeORM)  and/or  EventPublisher → RabbitMQ
                                          ↓
                              Worker consumer → Task → external service
```

---

## Tech stack

- **NestJS 11** / TypeScript 5.7 / Node 22
- **PostgreSQL 18** (uses native `uuidv7()` for primary keys — 18 is required, not optional)
- **TypeORM** with explicit migrations (`synchronize: false`)
- **RabbitMQ 4** via `@nestjs/microservices` (durable queues, fanout DLX, persistent messages)
- **OpenTelemetry** SDK + OTLP/HTTP exporter
- **OTel Collector (contrib)** → **Grafana Tempo** → **Grafana**
- **pino** (`nestjs-pino`) for structured logs
- **Swagger** via `@nestjs/swagger`

---

## Project structure

```
src/
├── core/
│   ├── domain/
│   │   ├── app.module.ts            # API composition root
│   │   ├── worker.module.ts         # worker composition root
│   │   ├── auth/                    # sign-in, sign-up
│   │   ├── user/                    # create-user command, find-users query
│   │   ├── api-key/                 # generate-api-key command (global module)
│   │   └── notification/            # consumer + send-email task
│   └── entities/                    # User, ApiKey, BaseCoreEntity
├── infra/
│   ├── database/                    # TypeORM module, datasource, migrations
│   ├── repositories/                # TypeORM implementations
│   ├── rabbitmq/                    # publisher, queue setup, routing keys, helpers
│   ├── tracing/instrumentation.ts   # OTel NodeSDK bootstrap
│   ├── interceptors/                # trace-request-id interceptor
│   ├── guards/                      # ApiKeyGuard, JwtAuthGuard
│   ├── filters/                     # GlobalExceptionFilter
│   ├── logger/                      # pino wrapper behind ILogger
│   └── health/                      # terminus /health
├── shared/
│   ├── config/                      # app config, swagger config
│   ├── decorators/                  # JwtProtected, ApiKeyProtected, TraceRoute
│   ├── packs/                       # composed validation + Swagger decorators
│   ├── errors/                      # BaseError + typed 4xx/5xx exceptions
│   └── utils/                       # getEnv, pagination
└── entry/                           # api | worker | repl
```

---

## Quick start

**Prerequisites:** Node 22+, Docker, npm.

```bash
# 1. install
npm install

# 2. env
cp .env.example .env          # then fill in JWT_SECRET

# 3. infra: postgres, rabbitmq, otel-collector, tempo, grafana
npm run docker:up

# 4. schema
npm run migration:run

# 5. run
npm run dev                   # API   → http://localhost:3000
npm run worker                # worker (separate terminal)
```

Then:

| Service | URL | Credentials |
|---|---|---|
| API | http://localhost:3000 | — |
| Swagger | http://localhost:3000/docs | — |
| Health | http://localhost:3000/health | — |
| RabbitMQ management | http://localhost:15672 | `guest` / `guest` |
| Grafana | http://localhost:3900 | `admin` / `password` |
| Tempo (query API) | http://localhost:3200 | — |
| OTLP collector | `:4317` (gRPC), `:4318` (HTTP) | — |

Tear down with `npm run docker:down`.

---

## Environment variables

Copy `.env.example` → `.env`. `JWT_SECRET` has no fallback and will throw at boot if missing.

| Variable | Default | Notes |
|---|---|---|
| `NODE_ENV` | `development` | `production` disables `.env` loading and pretty logs |
| `PORT` | `3000` | API port |
| `WORKER_PORT` | `3001` | Worker HTTP port (health) |
| `JWT_SECRET` | — | **Required.** No fallback |
| `LOG_LEVEL` | `info` | pino level |
| `CORS_ORIGIN` | `*` | Comma-separated list |
| `DATABASE_HOSTNAME` | `localhost` | |
| `DATABASE_PORT` | `5432` | |
| `DATABASE_USERNAME` | `postgres` | |
| `DATABASE_PASSWORD` | `password` | |
| `DATABASE_NAME` | `nestjs-starter-template-db` | |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | |
| `RABBITMQ_EXCHANGE` | `domain_events` | Direct exchange |
| `RABBITMQ_DLX` | `domain_events.dlx` | Fanout dead-letter exchange |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318/v1/traces` | Full traces path, not the base URL |
| `OTEL_SERVICE_NAME` | `nestjs-starter-template-api-server` | Shows up as `service.name` in Tempo |

The two `OTEL_*` variables are read at import time in `instrumentation.ts`, **before** `ConfigModule` loads `.env` — see [Known gaps](#known-gaps).

---

## Running the app

```bash
npm run dev        # API, ts-node-dev, hot reload
npm run worker     # RabbitMQ worker
npm run repl       # NestJS REPL (history in .nestjs_repl_history)

npm run build      # tsc + tsc-alias (resolves @domain/@infra/@shared path aliases)
npm run start      # node dist/entry/api/app.js
npm run start:worker
```

Docker images are provided for both processes (`docker/Dockerfile.api`, `docker/Dockerfile.worker`) — multi-stage, `node:22-alpine`, prod deps only. The `api` and `worker` services are commented out in `docker-compose.local.yml`; uncomment them to run the full stack in containers.

---

## Observability

### Trace pipeline

```
NestJS app ──OTLP/HTTP :4318──▶ OTel Collector ──OTLP/gRPC :4317──▶ Tempo ──▶ Grafana
                                (memory_limiter, batch)                       (:3900)
```

The collector also runs a `debug` exporter at `verbosity: detailed`, so every span is dumped to the collector's stdout — useful while wiring things up:

```bash
docker logs -f nestjs-starter-template-otel-collector
```

### SDK bootstrap

`src/infra/tracing/instrumentation.ts` starts a `NodeSDK` with HTTP, Express, and NestJS auto-instrumentation, tags the resource with `service.name`, `service.version`, and `deployment.environment.name`, and flushes on `SIGTERM`.

It **must** be the first import in the entrypoint — before any instrumented library is loaded:

```ts
import '@infra/tracing/instrumentation';   // src/entry/api/app.ts, line 1

import { AppModule } from '@domain/app.module';
// ...
```

### Custom spans

Business-level spans are created explicitly with a named tracer. Example from `SignInCommand`:

```ts
const tracer = trace.getTracer('sign-in-command');

const { accessToken, refreshToken } = await tracer.startActiveSpan(
  'sign-in-jwt',
  async (span) => {
    try {
      span.setAttributes({ user_id: user.id, user_name: user.name ?? '' });
      // ...work...
      span.setStatus({ code: SpanStatusCode.OK });
      return { accessToken, refreshToken };
    } finally {
      span.end();
    }
  },
);
```

### Correlating a request ID

`AppLoggerModule` generates or reuses `x-request-id` (and passes through `x-client-action-id`) for every request and attaches it to the pino log context.

To also stamp it onto the active span, decorate the route with `@TraceRoute()`:

```ts
@Post('sign-in')
@TraceRoute()
async signIn(@Body() body: SignInDto) { ... }
```

`TraceRoute` composes `SetMetadata('trace_request_id', true)` with `TraceRequestIdInterceptor`, which reads the header and sets `http.request_id` on the current span. In Grafana you can then search Tempo by `http.request_id` and pivot from a log line to its trace.

### Finding traces in Grafana

1. Open http://localhost:3900 (`admin` / `password`). The Tempo datasource is provisioned automatically from `docker/grafana-datasource.yaml`.
2. **Explore → Tempo → Search**.
3. Filter by service name, or by tag: `http.request_id = <uuid>`, `user_id = <uuid>`.

---

## Messaging

### Topology

Built at worker boot by `setupQueueBindings()`:

- Direct exchange `domain_events` (durable)
- Fanout DLX `domain_events.dlx` (durable)
- One queue per routing key, name derived by `routingKeyToQueueName()`: dots and dashes → underscores, suffix `_queue`
- One `.dlq` per queue, bound to the DLX

For the single routing key currently defined:

| Routing key | Queue | DLQ |
|---|---|---|
| `notification.send-email` | `notification_send_email_queue` | `notification_send_email_queue.dlq` |

### Delivery guarantees

| Setting | Where | Effect |
|---|---|---|
| `durable: true` | `queueOptions`, all declaration sites | Queue survives broker restart |
| `persistent: true` | client `options` in `rabbitmq.module.ts` | Message written to disk (`delivery-mode: 2`) |
| `noAck: false` | `connectMicroservice` options | Manual ack — broker redelivers if the worker dies mid-task |
| `prefetchCount: 1` | `connectMicroservice` options | One unacked message per consumer; fair dispatch across replicas |

Durable queue, persistent message, and manual ack are required together. Any one missing and the others buy you nothing.

> Two option names worth pinning down, because both fail silently when wrong: `persistent` is a **top-level** client option, sibling of `queue` and `queueOptions` — not a member of `queueOptions`. And the consumer-side option is **`prefetchCount`**, not `prefetch`; the latter is ignored and leaves prefetch unlimited (`RQM_DEFAULT_PREFETCH_COUNT = 0`).

### Publishing

`EventPublisher` resolves the right `ClientProxy` (`RABBITMQ_CLIENT_<routingKey>`) at call time via `ModuleRef`:

```ts
this.eventPublisher.publish(RoutingKeysEnum.NOTIFICATION_SEND_EMAIL, {
  email: 'example@mail.com',
  template: EmailTemplateEnum.WELCOME,
  data: { name: 'test' },
});
```

`@nestjs/microservices` only routes through an exchange when `wildcards` is set or `exchangeType` is `fanout`. With a `direct` exchange it calls `sendToQueue()` instead — see [Known gaps](#known-gaps).

### Consuming

`NotificationConsumer` acks on success and `nack`s with `requeue: false` on failure, which sends the message straight to the DLX. There is deliberately **no retry logic** — add it where it belongs for your workload.

### Adding a new event

1. Add the key to `RoutingKeysEnum` in `src/infra/rabbitmq/routing-key.ts`. Client, queue, and DLQ are wired automatically.
2. Create a task under `src/core/domain/<domain>/tasks/`.
3. Add an `@EventPattern(RoutingKeysEnum.YOUR_KEY)` handler in a consumer controller.
4. Register the module in `worker.module.ts`.

---

## Auth

Two independent mechanisms, both applied as composed decorators that also register the correct Swagger security scheme:

```ts
@ApiKeyProtected()   // x-api-key header → ApiKeyGuard → DB lookup + timingSafeEqual
@JwtProtected()      // Authorization: Bearer <jwt> → JwtAuthGuard → verify, attach req.user
```

Generate an API key through `GenerateApiKeyCommand` (easiest via the REPL):

```bash
npm run repl
> await get(GenerateApiKeyCommand).execute({ platform: 'local' })
```

---

## Database & migrations

Entities extend `BaseCoreEntity`: `id` (`uuid`, defaulted by Postgres `uuidv7()`), `created_at`, `updated_at` (both `timestamptz`).

```bash
npm run migration:generate    # diff entities → new migration file
npm run migration:run
npm run migration:revert
```

The TypeORM CLI datasource lives at `src/infra/database/datasource.ts` and reads `.env` directly via dotenv. `synchronize` is off everywhere — migrations are the only path to schema change.

---

## Conventions

**Use cases, not services.** One class, one `execute()`. Commands mutate, queries read: `CreateUserCommand`, `FindUsersQuery`, `SignInCommand`. They're registered under a `// usecases` comment block in each module.

**Packs.** `src/shared/packs/` composes `class-validator` and `@nestjs/swagger` decorators into a single decorator per type, so a DTO field declares validation and OpenAPI schema at once:

```ts
export class SignInDto {
  @StringPack()
  username: string;

  @StringPack({ options: { nullable: true } })
  password: string | null;
}
```

Available: `StringPack`, `NumberPack`, `BooleanPack`, `DatePack`, `EnumPack`, `ArrayPack`, `ObjectPack`, `SplitStringToArrayPack`.

**Errors.** Everything extends `BaseError` (status, message, optional code, optional context). `GlobalExceptionFilter` serializes known errors via `toJSON()` and collapses anything unknown into a 500 without leaking internals.

**Path aliases.** `@domain/*`, `@entities/*`, `@infra/*`, `@shared/*`. Resolved by `tsconfig-paths` in dev and rewritten by `tsc-alias` at build.

---

## API surface

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/auth/sign-up` | — | Create account, publishes welcome email event |
| `POST` | `/v1/auth/sign-in` | — | Returns `{ credentials: { accessToken, refreshToken } }`. Traced via `@TraceRoute()` |
| `POST` | `/v1/users` | `x-api-key` | Create user |
| `GET` | `/v1/users` | Bearer JWT | Paginated user list |
| `GET` | `/health` | — | Terminus check with DB ping |
| `GET` | `/docs` | — | Swagger UI |

---

## Scripts

| Script | Purpose |
|---|---|
| `dev` / `worker` / `repl` | Run API / worker / REPL in watch mode |
| `build` | `tsc` + `tsc-alias` |
| `start` / `start:worker` | Run compiled output |
| `docker:up` / `docker:down` | Local infra stack |
| `migration:generate` / `run` / `revert` | TypeORM migrations |
| `lint` / `format` | ESLint (`--fix`) / Prettier |
| `test` / `test:watch` / `test:cov` / `test:e2e` | Jest |

---

## Known gaps

Honest list of what this branch does **not** do yet.

### Messaging

- **The direct exchange is declared but never published through.** `ClientRMQ.dispatchEvent` only routes via an exchange when `wildcards` is set or `exchangeType` is `fanout`; with `direct` it falls back to `sendToQueue()`. Messages still reach the right consumer, because both sides derive the same queue name from `routingKeyToQueueName()` — but `domain_events` receives nothing and the bindings created by `setupQueueBindings()` go unused. Adding `routingKey` to the client options does not change this. Real fixes: switch to `wildcards: true` (conflicts with the queue-per-key design, since every handler registers on every microservice), drop the exchange and own the queue-per-event model explicitly, or hand-roll the publisher on `amqp-connection-manager`.
- **`EventPublisher.publish()` swallows failures.** It returns `void` and never subscribes to `emit()`, so a broker outage surfaces as an unhandled rxjs error rather than reaching the logger or the caller. The `'Publishing event'` log is written before dispatch, so it reports success for messages that never left the process.
- **Full event payloads are logged at `info`.** `SendEmailTaskPayloadDto` carries an email address today and will carry reset tokens once `PASSWORD_RESET` is used. Move to `debug`.
- **Topology is declared in three places** — `setupQueueBindings()`, the client factory, and `connectMicroservice()` — each with its own copy of the queue arguments. A mismatch produces `PRECONDITION_FAILED (406)` and a closed channel, and only when one side happens to declare first.
- **One AMQP connection per routing key, per process.** `ClientsModule.registerAsync` builds a client per key on the API side and `connectMicroservice` does the same on the worker. Twenty events across ten pods is 200 connections.
- **No retry policy.** A failed task goes straight to the DLQ on first attempt, and nothing consumes the DLQ.

### Tracing

- **Trace context does not cross RabbitMQ.** The publisher doesn't inject W3C `traceparent` into message headers and the consumer doesn't extract it, so a trace ends at publish and the worker's work starts a new, unlinked trace. `RmqRecordBuilder().setOptions({ headers })` is the hook on the publish side.
- **The worker isn't instrumented at all.** `src/entry/worker/app.ts` never imports `@infra/tracing/instrumentation`.
- **No amqplib or pg instrumentation.** DB queries and broker calls produce no spans. `@opentelemetry/instrumentation-fs` is installed but not registered.
- **Logs aren't correlated with traces.** pino doesn't emit `trace_id` / `span_id`, so there's no log↔trace pivot in Grafana beyond manually matching `http.request_id`.
- **`OTEL_*` variables in `.env` are ignored.** `instrumentation.ts` runs before `ConfigModule` reads the file, so only shell or container env vars take effect. Adding `import 'dotenv/config'` as the first line of `instrumentation.ts` fixes it.
- **Tempo has no volume.** Traces are written to `/tmp` inside the container and vanish on restart.
- **`x-client-action-id`** is captured by the logger but never set as a span attribute.
- **`@TraceRoute()` is applied to one route only** (`sign-in`), and `AttachRequestIdPipe` is defined but unused — `TraceRequestIdInterceptor` superseded it.

### Application

- **`SignInCommand` never verifies the password**, and `SignUpCommand` stores it in plaintext. Placeholder auth — do not ship.
- `.env.example` is missing `PORT`, `WORKER_PORT`, `LOG_LEVEL`, `CORS_ORIGIN`, and both `OTEL_*` variables, and still lists the dead `RABBITMQ_WORKER_QUEUE` / `RABBITMQ_DLQ`.
- `rabbitmq.queue` and `rabbitmq.deadLetterQueue` in `app.config.ts` have no readers — queue and DLQ names are derived.
- `npm run cli` points at `src/entry/cli/app.ts`, which doesn't exist.
- `src/infra/service/{internal,external}/{bmi,score,payment,s3}.service.ts` are empty placeholders.
- No unit tests; `test/app.e2e-spec.ts` is the untouched Nest scaffold.

---

## License

UNLICENSED — private template.
