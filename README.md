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

The prod environment is build as a docker package, build from the current working copy with the following command.

```
npm run docker-build
```

You can run the build container with the following command, which will expose it at http://localhost:3000.
```
npm run docker-run
```

You can push the container to digital ocean with the following command, which will(?) update production.
```
npm run docker-push
```





