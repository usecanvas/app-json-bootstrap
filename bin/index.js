#!/usr/bin/env node

'use strict';

const Dotenv  = require('dotenv')
const FS      = require('fs');
const Path    = require('path');
const appJSON = require(Path.join(process.cwd(), './app.json'));
const prompt  = require('prompt');

const appEnv  = appJSON.env;
const schema  = { properties: {} };

let env;
try {
  env = Dotenv.parse(FS.readFileSync(Path.join(process.cwd(), './.env')));
} catch(err) {
  env = {};
}

write(`Building environment for "${appJSON.name}"...\n`);

prompt.start();
prompt.message = '>';
prompt.delimiter = ' ';

for (const key in appEnv) {
  if (!appEnv.hasOwnProperty(key)) {
    continue;
  }

  const envVar = appEnv[key];

  let required = true;
  if (envVar.local === false || envVar.required === false) {
    required = false;
  }

  schema.properties[key] = {
    description: key,
    required   : required,
    default    : env[key] || envVar.value,
    type       : 'string'
  };
}

prompt.get(schema, (err, result) => {
  let envFile = '';

  for (const key in result) {
    if (!result.hasOwnProperty(key)) {
      continue;
    }

    envFile += `${key}=${result[key]}\n`;
  }

  FS.writeFileSync(Path.join(process.cwd(), './.env'), envFile);

  write('Thank you for your time!');
});

function write(text) {
  process.stdout.write(`${text}\n`);
}
