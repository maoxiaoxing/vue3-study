#!/usr/bin/env node
const koa = require('koa')
const send = require('koa-send')

const app = new koa()

const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    stream.on('error', reject)
  })
}

app.use(async (ctx, next) => {
  await send(ctx, ctx.path, {
    root: process.cwd(),
    index: 'index.html',
  })
  await next()
})

app.use(async (ctx, next) => {
  if (ctx.type === 'application/javascript') {
    const contents = await streamToString(ctx.body)
    ctx.body = contents.replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
  }
})

app.listen(3000)
console.log('server is running http://localhost:3000')
