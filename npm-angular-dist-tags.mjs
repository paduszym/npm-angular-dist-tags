#!/usr/bin/env node
import Config from '@npmcli/config';
import defs from '@npmcli/config/lib/definitions/index.js';
import pkgJson from '@npmcli/package-json';
import npa from 'npm-package-arg';
import npmFetch from 'npm-registry-fetch';
import pacote from 'pacote';
import semver from 'semver';

const {shorthands, definitions, flatten} = defs;
const config = new Config({
  npmPath: '.', definitions, shorthands, flatten, argv: []
});
await config.load();
config.validate();

const spec = npa(process.argv[2] ?? '.');
const opts = {...config.flat};
const manifest = await getManifest(spec, opts);
const resolved = npa.resolve(manifest.name, manifest.version);
const registry = npmFetch.pickRegistry(resolved, opts);
const packumentUrl =
  `${registry.replace(/\/$/, '')}/${encodeURIComponent(manifest.name)}`;
const packument = await npmFetch.json(packumentUrl);
const versions = semver.rsort(Object.keys(packument.versions)
  .map(v => semver.parse(v)));

const distTags = {};
let latestMajor = 0;
versions.forEach(({prerelease, raw, major}) => {
  if (prerelease.length === 0) {
    if (distTags['latest'] === undefined) {
      distTags['latest'] = raw;
      latestMajor = major;
    } else if (latestMajor > major && distTags[`v${major}-lts`] === undefined) {
      distTags[`v${major}-lts`] = raw;
    }
  } else if (prerelease.length === 2) {
    const [id] = prerelease;
    if (id === 'next' && distTags['next'] === undefined) {
      distTags['next'] = raw;
    } else if (id === 'rc' && distTags['beta'] === undefined) {
      distTags['beta'] = raw;
    }
  }
});

packument['dist-tags'] = distTags;
await npmFetch.json(packumentUrl, {method: 'PUT', body: packument, ...opts});

async function getManifest(spec, opts) {
  let manifest;
  if (spec.type === 'directory') {
    const pkg = await pkgJson.load(spec.fetchSpec);
    manifest = pkg.content;
  } else {
    manifest = await pacote.manifest(spec, {
      ...opts, fullmetadata: true, fullReadJson: true
    });
  }
  if (manifest.publishConfig) {
    flatten(manifest.publishConfig, opts);
  }
  return manifest;
}
