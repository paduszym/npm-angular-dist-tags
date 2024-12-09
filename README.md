# `npm-angular-dist-tags`

![NPM Version](https://img.shields.io/npm/v/npm-angular-dist-tags)
![NPM License](https://img.shields.io/npm/l/npm-angular-dist-tags)

Simple utility for automatically organizing any npm package dist-tags like
Angular does.

## Usage

```shell
npx npm-angular-dist-tags <pkg-spec>
```

where `<pkg-spec>` is local directory with `package.json` or just npm
package name.

## Example

```shell
##
# init sample package
##
$ mkdir foobar
$ cd foobar
$ npm init -y

##
# publish some versions with default dist-tag
##
# 1.0.0
$ npm publish
# 2.0.0
$ npm version major
$ npm publish
# 3.0.0-next.0
$ npm version premajor --preid next
$ npm publish
# 3.0.0-rc.0
$ npm version prerelease --preid rc
$ npm publish
# 3.0.0
$ npm version major
$ npm publish

##
# reorganize dist-tags
##
$ npx npm-angular-dist-tags .

##
# list tags
##
$ npm dist-tag ls foobar
beta: 3.0.0-rc.0
next: 3.0.0-next.0
latest: 3.0.0
v1-lts: 1.0.0
v2-lts: 2.0.0
```
