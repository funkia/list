# Tree shaking size test

This tests the bundle sizes achieved when including List in a
production build with Webpack. The intention is to ensure that List is
compatible with tree shaking.

The following command generates the various bundles.

```
npm run build
```

And their sizes can be inspected with.

```
ls -lh dist
```

Which gives a result like the following.

```
589B May  6 12:42 baseline.js
1.6K May  6 12:42 bundle1.js
3.6K May  6 12:42 bundle2.js
3.7K May  6 12:42 curried.js
 21K May  6 12:42 methods.js
```