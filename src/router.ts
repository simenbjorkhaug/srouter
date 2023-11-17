// deno-lint-ignore-file ban-types no-explicit-any
import { route as surl } from 'npm:@bjorkhaug/surl'
import { Methods } from 'npm:@bjorkhaug/smethod'
import { BASE_ERROR, BASE_MIDDLEWARE, ROUTE_MIDDLEWARE } from './symbols.ts'

export async function route(
  request: Request,
  target: { new (): any },
) {
  const url = new URL(request.url)

  if (Reflect.hasMetadata(BASE_MIDDLEWARE, target.constructor)) {
    const middleware = Reflect.getMetadata(
      BASE_MIDDLEWARE,
      target.constructor,
    ) as (Function)[]

    for (const fn of middleware) {
      if (typeof fn === 'function') {
        await fn.call(target, { request, params: new Map() })
      }
    }
  }

  const routes = ((Methods.getRoutes(target.constructor) as {
    route: string
    method: string
    handler: Function
  }[]) ?? []).toSorted((a, b) => {
    const aSegments = a.route.split('/')
    const bSegments = b.route.split('/')

    for (let i = 0; i < Math.min(aSegments.length, bSegments.length); i++) {
      if (aSegments[i] !== bSegments[i]) {
        if (aSegments[i].includes('{') && !bSegments[i].includes('{')) {
          return -1
        } else if (!aSegments[i].includes('{') && bSegments[i].includes('{')) {
          return 1
        }
      }
    }

    return a.route.localeCompare(b.route)
  })

  for (const { method, route, handler } of routes) {
    const segment = route.replace(/\/+/g, '/')

    if (request.method.toUpperCase() === method) {
      try {
        if (segment === url.pathname) {
          if (Reflect.hasMetadata(ROUTE_MIDDLEWARE, handler)) {
            const middleware = Reflect.getMetadata(
              ROUTE_MIDDLEWARE,
              handler,
            ) as Function[]
            for (const fn of middleware) {
              if (typeof fn === 'function') {
                await fn.call(target, { request, params: new Map() })
              }
            }
          }

          const result = await handler.call(target, {
            request,
            params: new Map(),
          })
          return result
        }

        const match = surl(segment, url)

        if (match) {
          if (Reflect.hasMetadata(ROUTE_MIDDLEWARE, handler)) {
            const middleware = Reflect.getMetadata(
              ROUTE_MIDDLEWARE,
              handler,
            ) as Function[]
            for (const fn of middleware) {
              if (typeof fn === 'function') {
                await fn.call(target, { request, params: new Map() })
              }
            }
          }

          const result = await handler.call(target, { request, params: match })
          return result
        }
      } catch (error) {
        if (Reflect.hasMetadata(BASE_ERROR, target.constructor)) {
          const fn = Reflect.getMetadata(BASE_ERROR, target.constructor)

          if (typeof fn === 'function') {
            return fn.call(target, { request, params: new Map(), error })
          }

          return new Response('Internal server error', {
            status: 500,
            statusText: 'Internal server error',
          })
        }
      }
    }
  }
}

export async function router(
  ...args: (() => ReturnType<typeof route>)[]
) {
  for await (const arg of args) {
    const response = await arg()

    if (response && response instanceof Response) {
      return response
    }
  }
}
