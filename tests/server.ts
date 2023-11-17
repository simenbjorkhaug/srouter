import 'npm:@bjorkhaug/sreflect'
import { Catch, type CatchParams, route, router } from '../mod.ts'
import { Get } from 'npm:@bjorkhaug/smethod'
import { Container, Service } from 'npm:@bjorkhaug/sdi'

@Service()
class _Logger {
  info(message: string) {
    console.log(message)
  }
}

class AnotherController {
  @Get('/test/sub')
  sub() {
    return new Response('Sub', {
      headers: {
        'content-type': 'text/plain',
      },
    })
  }
}

@Catch(function (this: TestController, { error }: CatchParams) {
  console.error(error)
  return new Response('Something went wrong...', {
    status: 500,
    headers: {
      'content-type': 'text/plain',
    },
  })
})
@Service()
class TestController {
  constructor(private logger: _Logger) {}

  // @Middleware(() => {
  //   // throw new Error('I stopped the request!')
  // })
  // @Get('/{message}')
  // get({ params }: RouteParams) {
  //   return new Response(`Hello, ${params.get('message')}!`, {
  //     headers: {
  //       'content-type': 'text/plain',
  //     },
  //   })
  // }

  @Get('/error')
  error() {
    throw new Error('Something went wrong...')
  }
}

Deno.serve({ port: 3000 }, async (request: Request) => {
  const response = await router(
    () => route(request, Container.get(TestController)),
    () => route(request, Container.get(AnotherController)),
  )

  if (response) {
    return response
  }

  return new Response('Not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain',
    },
  })
})
