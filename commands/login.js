'use strict';

const cli = require('heroku-cli-util');
const co = require('co');
const child = require('child_process');
const log = require('../lib/log');

module.exports = function(topic) {
  return {
    topic: topic,
    command: 'login',
    flags: [{ name: 'verbose', char: 'v', hasValue: false }],
    description: 'Logs in to the Heroku Docker registry',
    needsApp: false,
    needsAuth: true,
    run: cli.command(co.wrap(login))
  };
};

function* login(context, heroku) {
  let herokuHost = process.env.HEROKU_HOST || 'heroku.com';
  let registry = `registry.${ herokuHost }`;
  let password = context.auth.password;

  try {
    let user = yield dockerLogin(registry, password, context.flags.verbose);
  }
  catch (err) {
    cli.error(`Error: docker login exited with ${ err }`);
    cli.hush(err.stack || err);
  }
}

function dockerLogin(registry, password, verbose) {
  return new Promise((resolve, reject) => {
    let args = [
      'login',
      '--username=_',
      `--password=${ password }`,
      registry
    ];
    log(verbose, args);
    child.spawn('docker', args, { stdio: 'inherit' })
      .on('exit', (code, signal) => {
        if (signal || code) reject(signal || code);
        else resolve();
      });
  });
}
