import { stylesToTokens } from './transform/styles/stylesToTokens';

import { variablesToTokens } from './transform/variablesToTokens';
import { mergeStylesIntoTokens } from './transform/mergeStylesIntoTokens';
import { IResolver } from './resolver';

const buildMeta = (
  config: ExportSettingsI,
  state?: PluginStateI
): MetaPropsI => ({
  useDTCGKeys: config.useDTCGKeys,
  colorMode: config.colorMode,
  variableCollections: state?.variableCollections,
  createdAt: new Date().toISOString(),
});

export const getTokens = async (
  resolver: IResolver,
  config: ExportSettingsI,
  state?: PluginStateI
) => {
  const variableCollection = await resolver.getLocalVariableCollections();
  const variables = await resolver.getLocalVariables();

  // convert variables to tokens
  const variableTokens = await variablesToTokens(
    variables,
    variableCollection,
    config,
    resolver
  );

  // convert styles to tokens
  const styleTokens = await stylesToTokens(config, resolver);

  // merge variables and styles
  const mergedVariables = mergeStylesIntoTokens(
    variableTokens,
    styleTokens,
    config.storeStyleInCollection
  );

  const metaData = buildMeta(config, state);

  if (config.splitByCollection) {
    // Return a map of { collectionName: tokens } where each entry gets its own meta
    const result: Record<string, any> = {};
    for (const key of Object.keys(mergedVariables)) {
      result[key] = {
        ...mergedVariables[key],
        $extensions: { 'tokens-bruecke-meta': metaData },
      };
    }
    return result;
  }

  // add meta to mergedVariables
  mergedVariables['$extensions'] = {
    'tokens-bruecke-meta': metaData,
  };

  // console.log("mergedVariables", mergedVariables);

  return mergedVariables;
};
