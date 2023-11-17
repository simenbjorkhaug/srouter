// deno-lint-ignore-file ban-types
import { type RouteParams } from './route.ts'
import { BASE_ERROR } from './symbols.ts'

export type CatchParams = RouteParams & { error: Error }

export const Catch = function <T>(
  handler: (this: T, arg: CatchParams) => Response,
) {
  return function (target: Object) {
    Reflect.defineMetadata(BASE_ERROR, handler, target)
  }
}
