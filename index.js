const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = await crawler();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());
app.listen(process.env.PORT || 3000);

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

// Heroku setting
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true, slowMo: 10, downloadPath: './tmp' };

const crawler = async () => {
  const browser = await puppeteer.launch(LAUNCH_OPTION); // Launch Option
  const page = await browser.newPage();
  await page.emulate(pc);

  await page._client.send(
    'Page.setDownloadBehavior',
    {behavior : 'allow', downloadPath: './tmp'}
  );
  
  await page.goto('https://bitflyer.com/ja-jp/login')
  await page.waitForSelector('#loginForm');
  console.log('login page: https://bitflyer.com/ja-jp/login');

  // user pass
  await page.type('input[name="ctl00$MainContent$email"]', USER_ID);
  await page.type('input[name="ctl00$MainContent$password"]', PASSWORD);
  console.log('ID/Pass typed');

  // login
  await page.click('input[name="ctl00$MainContent$Button1"]');
  console.log('Login!');
  // await page.screenshot({path: 'tmp/login.png', fullPage: true});

  // 2factor auth
  // await page.click('input[name="ctl00$MainContent$ctl00"]');

  // Home check
  //await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
  //await page.screenshot({path: 'tmp/home.png', fullPage: true});

  console.log('Home page');

  await page.waitForNavigation({timeout: 60000, waitUntil: 'networkidle2'});

  // goto tradehistory
  await page.goto('https://bitflyer.com/ja-jp/ex/TradeHistory');
  console.log('Trade History page: https://bitflyer.com/ja-jp/ex/TradeHistory');

  //await page.waitForNavigation({timeout: 60000, waitUntil: 'networkidle2'});
  
  // DL button click
  await page.click('#MainContent_DownloadReportButton')
  console.log('DL clicked');

  console.log('good bye!');
  //await browser.close();
}