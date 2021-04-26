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

## Deployment

The prod environment is build as a docker package, build from the current working copy with the following command.

```
tools/build (tag)
```

You can run the build container with the following command, which will expose it at http://localhost:3000.
```
tools/docker-run (tag)
```

You can push the container to digital ocean and update the k8s deplyometn with the following command.
```
tools/deploy (tag)
```

### blockworld-base

If the blockworld-base image isn't available, you can build it. It's split out to avoid re-building it whenever
files on the filesystem change.

```
cd blockworld-base
./build
```