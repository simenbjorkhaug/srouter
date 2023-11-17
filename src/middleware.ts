// deno-lint-ignore-file ban-types
import { RouteParams } from './route.ts'
import { BASE_MIDDLEWARE, ROUTE_MIDDLEWARE } from './symbols.ts'

export const Middleware = function (
  ...handlers: ((arg: RouteParams) => void)[]
) {
  return function (
    target: Object,
    key?: string,
    descriptor?: PropertyDescriptor,
  ) {
    for (const handler of handlers) {
      if (key && descriptor) {
        if (Reflect.hasMetadata(ROUTE_MIDDLEWARE, descriptor.value, key)) {
          const existing_metadata = Reflect.getMetadata(
            ROUTE_MIDDLEWARE,
            handler,
          ) as (typeof handler)[]

          Reflect.defineMetadata(
            ROUTE_MIDDLEWARE,
            [handler, ...existing_metadata],
            descriptor.value,
          )
        } else {
          Reflect.defineMetadata(
            ROUTE_MIDDLEWARE,
            [handler],
            descriptor.value,
          )
        }
      } else {
        if (Reflect.hasMetadata(BASE_MIDDLEWARE, target)) {
          const existing_metadata = Reflect.getMetadata(
            BASE_MIDDLEWARE,
            target,
          ) as (typeof handler)[]

          Reflect.defineMetadata(
            BASE_MIDDLEWARE,
            [handler, ...existing_metadata],
            target,
          )
        } else {
          Reflect.defineMetadata(BASE_MIDDLEWARE, [handler], target)
        }
      }
    }
  }
}
