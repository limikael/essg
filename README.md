# essg
Static Site Generator based on [preact](https://preactjs.com/) and [esbuild](https://esbuild.github.io/).

## Premise
essg works with an array of pages, specified in a yaml file. For each page, it uses a template to render a page. The template is a .jsx file which
exports a single function. The template function will receive as props all fileds specified in the yaml file for that page. The template functon will
also receive an array containing all the pages, in order to render menus etc.
