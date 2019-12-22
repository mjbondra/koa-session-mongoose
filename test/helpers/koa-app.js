"use strict";

const Koa = require("koa");
const koaBodyParser = require("koa-bodyparser");
const KoaRouter = require("koa-router");
const koaSession = require("koa-session");

const MongooseStore = require("../../lib");

module.exports = () => {
  const app = new Koa();
  const router = new KoaRouter();

  app.keys = ["7234619e-2639-4812-b35c-3cdf60427f04"];
  app.use(koaSession({ store: new MongooseStore() }, app));
  app.use(koaBodyParser());

  router.post("/sessions", (ctx, next) => {
    const { request, session } = ctx;
    Object.assign(session, request.body);
    ctx.body = { session };
    ctx.status = 201;
    return next();
  });

  router.put("/sessions/:sid", (ctx, next) => {
    const { request, session } = ctx;
    Object.assign(session, request.body);
    ctx.body = { session };
    return next();
  });

  router.delete("/sessions/:sid", (ctx, next) => {
    ctx.session = null;
    ctx.body = null;
    return next();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
