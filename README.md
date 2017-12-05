<h1 align="center">
  <!-- Logo -->
  <br/>
  &lt;loading&gt; Tag
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg" alt="API Stability"/>
  </a>
  <!-- TypeScript -->
  <a href="http://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-typescript-blue.svg" alt="TypeScript"/>
  </a>
  <!-- Prettier -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- Travis build -->
  <a href="https://travis-ci.org/DylanPiercey/loading-tag">
  <img src="https://img.shields.io/travis/DylanPiercey/loading-tag.svg" alt="Build status"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/loading-tag">
    <img src="https://img.shields.io/npm/v/loading-tag.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/loading-tag">
    <img src="https://img.shields.io/npm/dm/loading-tag.svg" alt="Downloads"/>
  </a>
</h1>

Maybefill for a `<loading>` tag which allows for client reordering of async html.

The idea here is to have a standard implementation to support out of order flushing (or progressive rendering) of html.

Click [here](https://www.ebayinc.com/stories/blogs/tech/async-fragments-rediscovering-progressive-html-rendering-with-marko/) for some information regarding progressive rendering and it's implementation in [Marko](https://markojs.com).


# Installation

```console
npm install loading-tag
```

# Quickstart

To enable the `<loading>` tag on your website you need to first include a `<script>` in the `<head>` of your document.
You can follow the examples below or include the script from a cdn like so:

```html
<script src="https://unpkg.com/loading-tag/dist/index.min.js"></script>
```

# Example

After a `<template>` tag is flushed it's contents will be inserted before a related `<loading>` tag.

The `<loading>` tag will also have a `loaded` attribute set with a default style of `display:none`.
Ideally in an official implementation this would be the `:loaded` psuedo selector in CSS.

```javascript
const fs = require('fs');
const http = require('http');

// Load the prebuilt script.
const script = fs.readFileSync(require.resolve('loading-tag'), 'utf-8');

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });

    // Send out initial html (must include script in <head>).
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
          <div>Pending</div>
        </loading>
      </div>
      <div>Other stuff</div>
      `);

    // Later you can flush more html using templates with matching id's
    // The following will add the template contents before the `loading[for="a"]` tag.
    setTimeout(() => {
      res.write(`
      <template id="a">
        <div>Resulting content.</div>
      </template>
      `);
    }, 500);

    // Finally end the html response.
    setTimeout(() => {
      res.end(`
      </body>
      </html>
      `);
    }, 1000);
  })
  .listen();

  // Final Output.
  `
  <!DOCTYPE html>
  <html>
  <head>...</head>
  <body>
    <div>
      My App
      <div>Resulting content.</div>
      <loading for="a">
        <div>Pending</div>
      </loading>
    </div>
    <div>Other stuff</div>
  </body>
  </html>
  `
```

# Example [chunk].

Occasionally you have many async chunks that you would like to flush as they become available.
Technically you could achieve this effect by nesting `<loading>` tags however having a native way to do this can be beneficial.

In this script if you flush a template with a chunk attribute (`<template id="a" chunk>`) it will append the template contents as you would expect but not trigger the `loaded` attribute to be applied to the related `<loading>` element. You can flush as many `<template>` tags with the same `id` assuming they have a `chunk` attribute and they will all be appended in the order they were flushed. On the final chunk you can signal the completion of the template by sending a final template with the same `id` but no `chunk` attribute.

```js
// Start sending html.
res.write('<!DOCTYPE html>...');

// Send a loading element to prepend html before.
res.write('<loading for="a">Pending</loading>');

// Continue writing synchronous html.
res.write('<div>Something Else</div>')

// Write template chunks at any point.
res.write('<template id="a" chunk>1</template>');
res.write('<template id="a" chunk>2</template>');
res.write('<template id="a" chunk>3</template>');

// Signal completion.
res.write('<template id="a">4</template>');

// Close document and finish response.
res.write('</body></html>')

// Final Output.
`
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  1
  2
  3
  4
  <loading for="a">Pending</loading>
  <div>Something else</div>
</body>
</html>
`
```


### Contributions

* Use `npm test` to build and run tests.

Please feel free to create a PR!
