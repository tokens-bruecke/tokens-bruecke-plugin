/// <reference path="../../global.d.ts" />

import yargs from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { RestAPIResolver } from './restApiResolver';
import { getTokens } from '../common/export';

const defaultConfig: ExportSettingsI = {
  includedStyles: {
    text: {
      isIncluded: false,
      customName: 'Typography-styles',
    },
    effects: {
      isIncluded: false,
      customName: 'Effect-styles',
    },
    grids: {
      isIncluded: false,
      customName: 'Grid-styles',
    },
    colors: {
      isIncluded: false,
      customName: 'Color-styles',
    },
  },
  storeStyleInCollection: 'none',
  colorMode: 'hex',
  includeScopes: false,
  includeValueStringKeyToAlias: false,
  includeFigmaMetaData: false,
  useDTCGKeys: false,
  usePercentageOpacity: false,
};

const argv = yargs(process.argv.slice(2))
  .option('api-key', {
    alias: 'a',
    description: 'Figma personal access token (PAT)',
    type: 'string',
  })
  .option('oauth-token', {
    alias: 't',
    description: 'Figma OAuth token',
    type: 'string',
  })
  .check((args) => {
    if (!args['api-key'] && !args['oauth-token']) {
      throw new Error('Either --api-key or --oauth-token must be provided');
    }
    return true;
  })
  .option('file-key', {
    alias: 'f',
    description: 'Figma file key',
    type: 'string',
    demandOption: true,
  })
  .option('config', {
    alias: 'c',
    description: 'Path to configuration file',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    description: 'Path to output file',
    type: 'string',
    demandOption: true,
  })
  .help()
  .alias('help', 'h')
  .parseSync();

let config = {};

if (argv.config) {
  try {
    const configFile = readFileSync(argv.config, 'utf-8');
    config = JSON.parse(configFile);
  } catch (error) {
    console.error('Error reading configuration file:', error);
    process.exit(1);
  }
}

const options = {
  ...defaultConfig,
  ...config,
};

async function exportFigmaTokens() {
  const resolver = new RestAPIResolver(
    argv.fileKey,
    argv.apiKey,
    argv.oauthToken
  );
  const tokens = await getTokens(resolver, options);
  try {
    writeFileSync(argv.output, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('✨ Tokens successfully written to', argv.output);
  } catch (error) {
    console.error('🔴 Error writing to output file:', error);
    process.exit(1);
  }
}

exportFigmaTokens();
