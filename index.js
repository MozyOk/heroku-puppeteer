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
require('dotenv').config();

var USER_ID = process.env.MY_USER_ID;
var PASSWORD = process.env.MY_PASSWORD;
console.log('login via: ' + USER_ID);

const pc = {
  'name': 'Chrome Mac',
  'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  'viewport': {
      'width': 1200,
      'height': 800,
      'deviceScaleFactor': 1,
      'isMobile': false,
      'hasTouch': false,
      'isLandscape': false
  }
};

// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: false, slowMo: 10, };

const crawler = async () => {
  const browser = await puppeteer.launch(LAUNCH_OPTION); // Launch Optionの追加
  const page = await browser.newPage();
  await page.emulate(pc);
  
  await page.goto('https://bitflyer.com/ja-jp/login')
  await page.waitForSelector('#loginForm');

  // ユーザ名、パスワード入力
  await page.type('input[name="ctl00$MainContent$email"]', USER_ID);
  await page.type('input[name="ctl00$MainContent$password"]', PASSWORD);

  // ログインしてスクショ撮る
  await page.click('input[name="ctl00$MainContent$Button1"]');
  // await page.screenshot({path: 'tmp/login.png', fullPage: true});

  // 2段階認証があったら、ログイン後の電話番号認証の送信
  // await page.click('input[name="ctl00$MainContent$ctl00"]');

  // Home画面かどうかをチェック
  //await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
  //await page.screenshot({path: 'tmp/home.png', fullPage: true});

  await page.waitForNavigation({timeout: 600000, waitUntil: "domcontentloaded"});

  // 取引履歴ページに遷移
  await page.goto('https://bitflyer.com/ja-jp/ex/TradeHistory');
  
  // DLボタンをクリック
  await page.click('#MainContent_DownloadReportButton')

  //await browser.close();
}