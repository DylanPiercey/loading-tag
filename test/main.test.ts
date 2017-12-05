import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as assert from "assert";
import * as puppeteer from "puppeteer";

const nycPath = path.join(__dirname, "../.nyc_output");
const script = fs.readFileSync(require.resolve('..'), "utf-8");

describe("<loading> tag", () => {
  let browser: any;

  before(async () => browser = await puppeteer.launch());
  after(async () => await browser.close());

  describe('normal', () => {
    let page: any;
  
    before(async () => {
      const server = http
        .createServer((req, res) => {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(`
          <!DOCTYPE html>
          <html>
          <head>
          <meta charset="UTF-8">
          <title>title</title>
          <script>${script}</script>
          </head>
          <body>
          <div>
          My App
          <loading for="a">
          <div class="pending">Pending</div>
          </loading>
          </div>
          <div>Other stuff</div>
          `);
  
          setTimeout(() => {
            res.end(`
            <template id="a">
            <div class="result">Resulting content.</div>
            </template>
            </body>
            </html>
            `);
          }, 500);
        })
        .listen()
        .unref();

      page = await browser.newPage();
      await page.goto(`http://localhost:${server.address().port}`, {
        options: { waitUntil: "load" }
      });
    });
  
    it("should add .result div to dom", async () => {
      assert.ok(
        await page.evaluate(() => Boolean(document.querySelector(".result")))
      );
    });
  
    it("should properly move the .result div", async () => {
      assert.ok(
        await page.evaluate(
          () =>
            document.querySelector(".result").nextElementSibling ===
            document.querySelector("loading")
        )
      );
    });
  });

  describe('chunked', () => {
    let page: any;
  
    before(async () => {
      const server = http
        .createServer((req, res) => {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(`
          <!DOCTYPE html>
          <html>
          <head>
          <meta charset="UTF-8">
          <title>title</title>
          <script>${script}</script>
          </head>
          <body>
          <div>
          My App
          <loading for="a">
          <div class="pending">Pending</div>
          </loading>
          </div>
          <div>Other stuff</div>
          `);
  
          setTimeout(() => {
            res.write(`
            <template id="a" chunk>
            <div class="result">Resulting content 1.</div>
            </template>
            `);

            setTimeout(() => {
              res.write(`
              <template id="a" chunk>
              <div class="result">Resulting content 2.</div>
              </template>
              `);

              setTimeout(() => {
                res.end(`
                <template id="a">
                <div class="result">Resulting content 3.</div>
                </template>
                </body>
                </html>
                `);
              }, 500);
            }, 500);
          }, 500);
        })
        .listen()
        .unref();

      page = await browser.newPage();
      await page.goto(`http://localhost:${server.address().port}`, {
        options: { waitUntil: "load" }
      });
    });
  
    it("should add .result(s) div to dom", async () => {
      assert.ok(
        await page.evaluate(() => document.querySelectorAll(".result").length === 3)
      );
    });
  
    it("should properly move the .result div", async () => {
      assert.ok(
        await page.evaluate(
          () =>
            document.querySelector(".result + .result + .result").nextElementSibling ===
            document.querySelector("loading")
        )
      );
    });
  });
});
