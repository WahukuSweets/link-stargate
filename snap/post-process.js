const fs = require('fs');
const pathUtils = require('path');
const snapConfig = require('./snap.config.json');

const bundlePath = pathUtils.join(snapConfig.dist, snapConfig.outfileName);

let bundleString = fs.readFileSync(bundlePath, 'utf8');

// Alias `window` as `self`
bundleString = 'var self = window;\n'.concat(bundleString);

fs.writeFileSync(bundlePath, bundleString);
