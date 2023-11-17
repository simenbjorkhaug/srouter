# @bjorkhaug/srouter

This is a TypeScript library that provides routing and middleware functionality
for Deno built applications. It works in harmony with `npm:@bjorkhaug/smethods`
and `npm:@bjorkhaug/surl`.

## Features

- **Routing**: The library provides a `route` function that allows you to define
  routes for your application. Each route is associated with a specific
  controller method that handles requests to that route.

- **Middleware**: Middleware functions are functions that have access to the
  request object, state can be populated on a passed controller instance.
  Middlewares can be on a per route or per controller basis.

- **Error Handling**: The library provides a `Catch` decorator that allows you
  to define error handling logic for your routes. The catch decorator, if not
  returning a responds bubbles the error.

## Getting Started

To use this library, you need to import the necessary functions and decorators
from the main module:

```typescript
import { route, router } from 'npm:@bjorkhaug/srouter'
```

Then you can defined Controllers, routes and middleware:

```typescript
class MyController {
  @Get('/')
  index() {
    return new Response('Hello world', {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
```

Setting up the router and routes:

```typescript
Deno.serve(..., async (request: Request) => { 
    const response = await router(
        () => route(request, new MyController())
    )
})
```

This follows a pattern for a controller per route. The routes are also strict,
meaning it will match the first route from the first controller\
that has a match for that particular route.
