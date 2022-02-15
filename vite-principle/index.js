#!/usr/bin/env node
const koa = require('koa')
const send = require('koa-send')

const app = new koa()

app.use(async (ctx, next) => {
  await send(ctx, ctx.path, {
    root: process.cwd(),
    index: 'index.html',
  })
  await next()
})

app.listen(3000)
console.log('server is running http://localhost:3000')
