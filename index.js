const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = 'Hello World';
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());
app.listen(process.env.PORT || 3000);
