import { textStylesToTokens } from './textStylesToTokens';
import { gridStylesToTokens } from './gridStylesToTokens';
import { effectStylesToTokens } from './effectStylesToTokens';
import { colorStylesToTokens } from './colorStylesToTokens';
import { IResolver } from '@common/resolver';

export const stylesToTokens = async (
  props: ExportSettingsI,
  resolver: IResolver
) => {
  const {
    includedStyles,
    colorMode,
    useDTCGKeys,
    includeValueStringKeyToAlias,
  } = props;
  let styleTokens = [];

  if (!includedStyles) {
    return styleTokens;
  }

  // Extract text tokens
  if (includedStyles.text?.isIncluded) {
    const textTokens = await textStylesToTokens(
      includedStyles.text.customName,
      useDTCGKeys,
      includeValueStringKeyToAlias,
      resolver
    );

    styleTokens.push(textTokens);
  }

  // Extract grid tokens
  if (includedStyles.grids?.isIncluded) {
    const gridTokens = await gridStylesToTokens(
      includedStyles.grids.customName,
      useDTCGKeys,
      resolver
    );

    styleTokens.push(gridTokens);
  }

  // Extract effect tokens
  if (includedStyles.effects?.isIncluded) {
    const effectTokens = await effectStylesToTokens(
      includedStyles.effects.customName,
      colorMode,
      useDTCGKeys,
      includeValueStringKeyToAlias,
      resolver
    );

    styleTokens.push(effectTokens);
  }

  // Extract color tokens
  if (includedStyles.colors?.isIncluded) {
    const colorTokens = await colorStylesToTokens(
      includedStyles.colors.customName,
      colorMode,
      useDTCGKeys,
      includeValueStringKeyToAlias,
      resolver
    );

    styleTokens.push(colorTokens);
  }

  return styleTokens;
};
