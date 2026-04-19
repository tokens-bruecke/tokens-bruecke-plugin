import { groupObjectNamesIntoCategories } from '@common/transform/groupObjectNamesIntoCategories';
import { convertRGBA } from '@common/transform/color/convertRGBA';
import { getTokenKeyName } from '@common/transform/getTokenKeyName';
import { getAliasVariableName } from '@common/transform/getAliasVariableName';
import { IResolver } from '@common/resolver';

const convertGradientStopsToDTCG = async (
  gradientStops: ReadonlyArray<ColorStop>,
  colorMode: colorModeType,
  isDTCGFormat: boolean,
  includeValueStringKeyToAlias: boolean,
  resolver: IResolver
) => {
  const stops = [];

  for (let i = 0; i < gradientStops.length; i++) {
    const stop = gradientStops[i];
    let colorValue;

    // Each gradient stop can have its own bound variable for the color
    const stopBoundVariable = (stop as any).boundVariables?.color;

    if (stopBoundVariable?.id) {
      colorValue = await getAliasVariableName(
        stopBoundVariable.id,
        isDTCGFormat,
        includeValueStringKeyToAlias,
        resolver
      );
      console.log(
        `Stop ${i} (position ${stop.position}): Variable ID ${stopBoundVariable.id} resolved to:`,
        colorValue
      );
    } else {
      const colorWithOpacity = {
        r: stop.color.r,
        g: stop.color.g,
        b: stop.color.b,
        a: stop.color.a,
      };
      colorValue = convertRGBA(colorWithOpacity, colorMode);
      console.log(
        `Stop ${i} (position ${stop.position}): No bound variable, using direct color:`,
        colorValue
      );
    }

    stops.push({
      color: colorValue,
      position: stop.position,
    });
  }

  return stops;
};

export const colorStylesToTokens = async (
  customName: string,
  colorMode: colorModeType,
  isDTCGForamt: boolean,
  includeValueStringKeyToAlias: boolean,
  resolver: IResolver
) => {
  const keyNames = getTokenKeyName(isDTCGForamt);
  const paintStyles = await resolver.getLocalPaintStyles();

  let colorTokens = {};

  const allColorStyles = {};

  console.log('paintStyles', paintStyles);

  for (const style of paintStyles) {
    const styleName = style.name;
    const paints = style.paints;

    if (paints.length === 0) continue;

    const boundVariables = (style as any).boundVariables;

    // Handle solid color paints
    if (paints.length === 1 && paints[0].type === 'SOLID') {
      const paint = paints[0] as SolidPaint;

      // Check for bound variables (aliases)
      let aliasVariable = null;

      if (boundVariables?.paints && boundVariables.paints.length > 0) {
        aliasVariable = await getAliasVariableName(
          boundVariables.paints[0].id,
          isDTCGForamt,
          includeValueStringKeyToAlias,
          resolver
        );
      }

      const colorWithOpacity = {
        r: paint.color.r,
        g: paint.color.g,
        b: paint.color.b,
        a: paint.opacity !== undefined ? paint.opacity : 1,
      };

      const styleObject = {
        [keyNames.type]: 'color',
        [keyNames.value]:
          aliasVariable || convertRGBA(colorWithOpacity, colorMode),
      };

      allColorStyles[styleName] = styleObject;
    }

    // Handle gradient paints (LINEAR, RADIAL, ANGULAR, DIAMOND)
    else if (
      paints[0].type === 'GRADIENT_LINEAR' ||
      paints[0].type === 'GRADIENT_RADIAL' ||
      paints[0].type === 'GRADIENT_ANGULAR' ||
      paints[0].type === 'GRADIENT_DIAMOND'
    ) {
      const paint = paints[0] as GradientPaint;

      const gradientStops = await convertGradientStopsToDTCG(
        paint.gradientStops,
        colorMode,
        isDTCGForamt,
        includeValueStringKeyToAlias,
        resolver
      );

      const styleObject = {
        [keyNames.type]: 'gradient',
        [keyNames.value]: gradientStops,
      };

      allColorStyles[styleName] = styleObject;
    }
  }

  colorTokens[customName] = groupObjectNamesIntoCategories(allColorStyles);

  return colorTokens;
};
