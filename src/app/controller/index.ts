import { checkForVariables } from './checkForVariables';
import { getStorageConfig } from './getStorageConfig';

// import { removeDollarSign } from "../utils/removeDollarSign";

import { config } from './config';
import { getTokens } from '@common/export';
import { tokensToVariables } from '@common/transform/tokensToVariables';
import { PluginAPIResolver } from '@app/api/pluginApiResolver';

// clear console on reload
console.clear();

////////////////////////
// EXPORT TOKENS ///////
////////////////////////

const pluginConfigKey = 'tokenbrücke-config';

getStorageConfig(pluginConfigKey);

//
let isCodePreviewOpen = false;

const frameWidthWithCodePreview = 800;
const frameWidth = isCodePreviewOpen
  ? frameWidthWithCodePreview
  : config.frameWidth;

figma.showUI(__html__, {
  width: frameWidth,
  height: 600,
  themeColors: true,
});

let JSONSettingsConfig: JSONSettingsConfigI;

// listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  await checkForVariables(msg.type);

  // get JSON settings config from UI and store it in a variable
  if (msg.type === 'JSONSettingsConfig') {
    // update JSONSettingsConfig
    JSONSettingsConfig = msg.config;

    // console.log("updated JSONSettingsConfig received", JSONSettingsConfig);

    // handle client storage
    await figma.clientStorage.setAsync(
      pluginConfigKey,
      JSON.stringify(JSONSettingsConfig)
    );
  }

  // generate tokens and send them to the UI
  if (msg.type === 'getTokens') {
    await getTokens(
      new PluginAPIResolver(),
      JSONSettingsConfig,
      JSONSettingsConfig
    ).then((tokens) => {
      figma.ui.postMessage({
        type: 'setTokens',
        tokens: tokens,
        role: msg.role,
        server: msg.server,
      } as TokensMessageI);
    });
  }

  // import tokens and create variables
  if (msg.type === 'importTokens') {
    console.log('Importing tokens...', msg.tokens);

    try {
      const result = await tokensToVariables(
        msg.tokens,
        new PluginAPIResolver()
      );

      console.log('Import result:', result);

      // Send result back to UI
      figma.ui.postMessage({
        type: 'importResult',
        tokens: null,
        role: 'import',
        server: [],
        result: result,
      } as TokensMessageI);

      // Refresh the collections list if import was successful
      if (result.success) {
        await checkForVariables('checkForVariables');
      }
    } catch (error) {
      console.error('Import error:', error);

      figma.ui.postMessage({
        type: 'importResult',
        tokens: null,
        role: 'import',
        server: [],
        result: {
          success: false,
          message: `Import failed: ${error.message}`,
          collectionsCreated: 0,
          variablesCreated: 0,
          errors: [error.message],
        },
      } as TokensMessageI);
    }
  }

  // change size of UI
  if (msg.type === 'resizeUIHeight') {
    const currentWidth = isCodePreviewOpen
      ? frameWidthWithCodePreview
      : config.frameWidth;
    figma.ui.resize(currentWidth, Math.round(msg.height));
  }

  if (msg.type === 'openCodePreview') {
    isCodePreviewOpen = msg.isCodePreviewOpen;
    const nextWidth = isCodePreviewOpen
      ? frameWidthWithCodePreview
      : config.frameWidth;
    figma.ui.resize(nextWidth, Math.round(msg.height));
  }
};
