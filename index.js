const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = await crawler(); // クローラーの実行
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());
app.listen(process.env.PORT || 3000);

// ここからはクローラーのロジック
const puppeteer = require('puppeteer');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: false };

const crawler = async () => {
  const browser = await puppeteer.launch(LAUNCH_OPTION); // Launch Optionの追加
  const page = await browser.newPage();
  await page.goto('https://news.ycombinator.com', { waitUntil: 'networkidle2' });
  const newsTitles = await page.evaluate(() => {
    const elenemts = document.querySelectorAll('.itemlist .title > a');
    return [].map.call(elenemts, el => el.innerText);
  });
  await browser.close();
  return newsTitles;
}