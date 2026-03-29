/// <reference path="../../global.d.ts" />

import yargs from 'yargs';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
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
  splitByCollection: false,
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
    description:
      'Path to output file or directory (when --split-by-collection)',
    type: 'string',
    demandOption: true,
  })
  .option('split-by-collection', {
    alias: 's',
    description:
      'Write each collection as a separate .tokens.json file in the output directory',
    type: 'boolean',
    default: false,
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

const options: ExportSettingsI = {
  ...defaultConfig,
  ...config,
  splitByCollection:
    (config as any).splitByCollection ?? argv['split-by-collection'],
};

async function exportFigmaTokens() {
  const resolver = new RestAPIResolver(
    argv.fileKey,
    argv.apiKey,
    argv.oauthToken
  );
  const tokens = await getTokens(resolver, options);
  try {
    if (options.splitByCollection) {
      mkdirSync(argv.output, { recursive: true });
      for (const collectionName of Object.keys(tokens)) {
        const safeFileName = collectionName.replace(/[/\\?%*:|"<>]/g, '-');
        const filePath = join(argv.output, `${safeFileName}.tokens.json`);
        writeFileSync(
          filePath,
          JSON.stringify({ [collectionName]: tokens[collectionName] }, null, 2),
          'utf-8'
        );
        console.log('✨ Written', filePath);
      }
    } else {
      mkdirSync(dirname(argv.output), { recursive: true });
      writeFileSync(argv.output, JSON.stringify(tokens, null, 2), 'utf-8');
      console.log('✨ Tokens successfully written to', argv.output);
    }
  } catch (error) {
    console.error('🔴 Error writing to output file:', error);
    process.exit(1);
  }
}

exportFigmaTokens();
