# Blockworld

Simple javascript slippy map full of wolves. An old project to learn "modern javascritp" a la 2014. Nudged back into
life in 2021.

## Starting a dev environment

You'll need the following tools, if you don't already have them

```
npm install -g bower
npm install -g browserify
```

After cloning the repo, do the following:

```
npm install
bower install
npm run browserify
```

Then start the dev server:

```
./tools/www
open http://localhost:3000
```

## Starting a prod environment

You'll need supervisord installed, in addition to bower and browserify

```
npm install
bower install
npm run browserify
npm start
```
