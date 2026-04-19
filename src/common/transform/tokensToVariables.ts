import { IResolver } from '@common/resolver';

interface ImportResult {
  success: boolean;
  message: string;
  collectionsCreated: number;
  variablesCreated: number;
  variablesUpdated: number;
  errors: string[];
}

/**
 * Parses DTCG or standard token format to extract the value
 */
const getTokenValue = (token: any): any => {
  // DTCG format uses $value
  if (token.$value !== undefined) {
    return token.$value;
  }
  // Standard format uses value
  if (token.value !== undefined) {
    return token.value;
  }
  return null;
};

/**
 * Parses DTCG or standard token format to extract the type
 */
const getTokenType = (token: any): string | null => {
  // DTCG format uses $type
  if (token.$type !== undefined) {
    return token.$type;
  }
  // Standard format uses type
  if (token.type !== undefined) {
    return token.type;
  }
  return null;
};

/**
 * Parses DTCG or standard token format to extract the description
 */
const getTokenDescription = (token: any): string => {
  // DTCG format uses $description
  if (token.$description !== undefined) {
    return token.$description;
  }
  // Standard format uses description
  if (token.description !== undefined) {
    return token.description;
  }
  return '';
};

const VALID_VARIABLE_SCOPES: ReadonlyArray<VariableScope> = [
  'ALL_SCOPES',
  'TEXT_CONTENT',
  'CORNER_RADIUS',
  'WIDTH_HEIGHT',
  'GAP',
  'ALL_FILLS',
  'FRAME_FILL',
  'SHAPE_FILL',
  'TEXT_FILL',
  'STROKE_COLOR',
  'STROKE_FLOAT',
  'EFFECT_FLOAT',
  'EFFECT_COLOR',
  'OPACITY',
  'FONT_FAMILY',
  'FONT_STYLE',
  'FONT_WEIGHT',
  'FONT_SIZE',
  'LINE_HEIGHT',
  'LETTER_SPACING',
  'PARAGRAPH_SPACING',
  'PARAGRAPH_INDENT',
];

export const isValidVariableScope = (scope: any): scope is VariableScope => {
  return VALID_VARIABLE_SCOPES.includes(scope);
};

/**
 * Parses a token to extract scopes (standard format only: `scopes` key).
 */
export const getTokenScopes = (token: any): string[] | undefined => {
  if (token.scopes !== undefined && Array.isArray(token.scopes)) {
    return token.scopes;
  }
  return undefined;
};

/**
 * Checks if an object is a token (has value and type)
 */
const isToken = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const value = getTokenValue(obj);
  const type = getTokenType(obj);
  return value !== null && type !== null;
};

/**
 * Converts a hex color to RGB object
 */
const hexToRgb = (
  hex: string
): { r: number; g: number; b: number; a: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  let r: number,
    g: number,
    b: number,
    a: number = 1;

  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return { r, g, b, a };
};

/**
 * Parses RGBA CSS string to RGB object
 */
const rgbaToRgb = (
  rgba: string
): { r: number; g: number; b: number; a: number } => {
  const match = rgba.match(
    /rgba?\((\d+\.?\d*),\s*(\d+\.?\d*),\s*(\d+\.?\d*),?\s*(\d+\.?\d*)?\)/
  );
  if (!match) {
    throw new Error(`Invalid RGBA color: ${rgba}`);
  }

  return {
    r: parseFloat(match[1]) / 255,
    g: parseFloat(match[2]) / 255,
    b: parseFloat(match[3]) / 255,
    a: match[4] ? parseFloat(match[4]) : 1,
  };
};

/**
 * Converts token value to Figma variable value based on type
 */
const convertTokenValueToFigmaValue = (
  value: any,
  type: string,
  variableMap: Map<string, Variable>
): VariableValue => {
  // Handle alias references
  if (
    typeof value === 'string' &&
    value.startsWith('{') &&
    value.endsWith('}')
  ) {
    // Extract the alias path
    const aliasPath = value.slice(1, -1);
    // Remove .value suffix if present
    const cleanPath = aliasPath.replace(/\.value$/, '');
    // Convert dots to slashes for Figma variable name format
    const figmaPath = cleanPath.replace(/\./g, '/');

    // Try to find the referenced variable
    const referencedVariable = variableMap.get(figmaPath);
    if (referencedVariable) {
      return {
        type: 'VARIABLE_ALIAS',
        id: referencedVariable.id,
      } as VariableAlias;
    }

    // If variable not found yet, store the reference for later resolution
    console.warn(`Alias reference not resolved: ${cleanPath}`);
    return value; // Will need second pass to resolve
  }

  // Handle actual values based on type
  switch (type) {
    case 'color':
      if (typeof value === 'string') {
        if (value.startsWith('#')) {
          return hexToRgb(value);
        } else if (value.startsWith('rgb')) {
          return rgbaToRgb(value);
        }
      } else if (typeof value === 'object' && 'r' in value) {
        // Already in RGB format
        return value;
      }
      throw new Error(`Unsupported color format: ${value}`);

    case 'number':
    case 'dimension':
      // Remove px, rem, etc. and convert to number
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[a-z%]+$/i, ''));
      }
      return parseFloat(value);

    case 'boolean':
      return Boolean(value);

    case 'string':
      return String(value);

    default:
      // For unknown types, try to return as-is
      return value;
  }
};

/**
 * Maps token type to Figma variable resolved type
 */
const mapTokenTypeToFigmaType = (
  tokenType: string
): VariableResolvedDataType => {
  const typeMap: Record<string, VariableResolvedDataType> = {
    color: 'COLOR',
    number: 'FLOAT',
    dimension: 'FLOAT',
    boolean: 'BOOLEAN',
    string: 'STRING',
  };

  return typeMap[tokenType] || 'STRING';
};

/**
 * Extracts all tokens from a nested object structure
 */
const extractTokens = (
  obj: any,
  path: string[] = [],
  collectionName: string
): Array<{ path: string; token: any; collectionName: string }> => {
  const tokens: Array<{ path: string; token: any; collectionName: string }> =
    [];

  for (const key in obj) {
    if (
      key.startsWith('$') ||
      key === 'value' ||
      key === 'type' ||
      key === 'description' ||
      key === 'scopes'
    ) {
      continue; // Skip metadata keys
    }

    const value = obj[key];

    if (isToken(value)) {
      const tokenPath = [...path, key].join('/');
      tokens.push({ path: tokenPath, token: value, collectionName });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively extract from nested objects
      tokens.push(...extractTokens(value, [...path, key], collectionName));
    }
  }

  return tokens;
};

/**
 * Import design tokens and create Figma variables
 */
export const tokensToVariables = async (
  tokensData: any,
  resolver: IResolver
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    message: '',
    collectionsCreated: 0,
    variablesCreated: 0,
    variablesUpdated: 0,
    errors: [],
  };

  try {
    // Get existing collections and variables
    const existingCollections = await resolver.getLocalVariableCollections();
    const existingVariables = await resolver.getLocalVariables();

    // Create a map of existing variables by their full path
    const variableMap = new Map<string, Variable>();
    existingVariables.forEach((variable) => {
      const collection = existingCollections.find(
        (c) => c.id === variable.variableCollectionId
      );
      if (collection) {
        // Use slash separator to match the path format
        const fullPath = `${collection.name}/${variable.name}`;
        variableMap.set(fullPath, variable);
      }
    });

    // Remove metadata if present
    const cleanedData = { ...tokensData };
    delete cleanedData.$extensions;

    // Extract all collections from the tokens
    const collections: Map<string, any> = new Map();

    for (const collectionName in cleanedData) {
      const collectionData = cleanedData[collectionName];

      if (typeof collectionData === 'object' && collectionData !== null) {
        collections.set(collectionName, collectionData);
      }
    }

    // Process each collection
    for (const [collectionName, collectionData] of collections) {
      try {
        // Check if collection already exists
        let collection = existingCollections.find(
          (c) => c.name === collectionName
        );

        // Create collection if it doesn't exist (only possible in plugin context)
        if (!collection && typeof figma !== 'undefined') {
          try {
            collection =
              figma.variables.createVariableCollection(collectionName);
            result.collectionsCreated++;
          } catch (error) {
            result.errors.push(
              `Failed to create collection "${collectionName}": ${error.message}`
            );
            continue;
          }
        } else if (!collection) {
          result.errors.push(
            `Collection "${collectionName}" not found and cannot be created (not in plugin context)`
          );
          continue;
        }

        // Extract all tokens from this collection
        const tokens = extractTokens(collectionData, [], collectionName);

        // Process tokens and check for modes
        const modesData = new Map<string, Map<string, any>>();

        tokens.forEach(({ path, token }) => {
          const modes = token.$extensions?.mode || token.extensions?.mode;

          if (modes && typeof modes === 'object') {
            // Token has multiple mode values
            for (const modeName in modes) {
              if (!modesData.has(modeName)) {
                modesData.set(modeName, new Map());
              }
              modesData.get(modeName)!.set(path, {
                value: modes[modeName],
                type: getTokenType(token),
                description: getTokenDescription(token),
              });
            }
          }
        });

        // Create modes if they don't exist (only in plugin context)
        if (modesData.size > 0 && typeof figma !== 'undefined' && collection) {
          const modeNames = Array.from(modesData.keys());

          // Check if the first mode needs to be renamed
          const firstModeName = modeNames[0];
          if (
            collection.modes.length > 0 &&
            collection.modes[0].name !== firstModeName
          ) {
            try {
              // Rename the default mode to the first mode from tokens
              collection.renameMode(collection.modes[0].modeId, firstModeName);
            } catch (error) {
              result.errors.push(
                `Failed to rename default mode to "${firstModeName}": ${error.message}`
              );
            }
          }

          // Add any remaining modes
          for (let i = 1; i < modeNames.length; i++) {
            const modeName = modeNames[i];
            const existingMode = collection.modes.find(
              (m) => m.name === modeName
            );
            if (!existingMode) {
              try {
                // Add a new mode to the collection
                collection.addMode(modeName);
              } catch (error) {
                result.errors.push(
                  `Failed to create mode "${modeName}" in collection "${collectionName}": ${error.message}`
                );
              }
            }
          }

          // Refresh collection reference to get updated modes
          const updatedCollection =
            await figma.variables.getVariableCollectionByIdAsync(collection.id);
          if (updatedCollection) {
            collection = updatedCollection;
          }
        }

        // First pass: Create all variables (without setting values yet)
        const createdVariables: Array<{
          variable: Variable;
          token: any;
          path: string;
        }> = [];
        for (const { path, token } of tokens) {
          try {
            const tokenType = getTokenType(token);
            const tokenDescription = getTokenDescription(token);
            const tokenScopes = getTokenScopes(token);

            if (!tokenType) {
              result.errors.push(`Token at path "${path}" is missing type`);
              continue;
            }

            const fullPath = `${collectionName}/${path}`;

            // Check if variable already exists
            let variable = variableMap.get(fullPath);
            const isExisting = !!variable;

            if (!variable && typeof figma !== 'undefined' && collection) {
              // Create new variable - pass collection object, not ID
              const figmaType = mapTokenTypeToFigmaType(tokenType);
              variable = figma.variables.createVariable(
                path,
                collection,
                figmaType
              );

              variableMap.set(fullPath, variable);
              result.variablesCreated++;
            } else if (isExisting) {
              result.variablesUpdated++;
            }

            if (variable) {
              if (tokenDescription) {
                variable.description = tokenDescription;
              }

              if (tokenScopes) {
                const invalidScopes = tokenScopes.filter(
                  (s) => !isValidVariableScope(s)
                );
                if (invalidScopes.length > 0) {
                  result.errors.push(
                    `Token at path "${path}" has invalid scopes: ${invalidScopes.join(', ')}`
                  );
                }
                const validScopes = tokenScopes.filter(isValidVariableScope);
                if (validScopes.length > 0) {
                  variable.scopes = validScopes;
                }
              }
            }

            // Store for second pass (value setting)
            if (variable) {
              createdVariables.push({ variable, token, path });
            }
          } catch (error) {
            result.errors.push(
              `Failed to create variable at path "${path}": ${error.message}`
            );
          }
        }

        // Second pass: Set values for all variables (now all variables exist for alias resolution)
        for (const { variable, token, path } of createdVariables) {
          try {
            const tokenValue = getTokenValue(token);
            const tokenType = getTokenType(token);

            if (typeof figma !== 'undefined') {
              // Set the default mode value
              const defaultMode = collection!.modes[0];
              const figmaValue = convertTokenValueToFigmaValue(
                tokenValue,
                tokenType,
                variableMap
              );

              try {
                variable.setValueForMode(defaultMode.modeId, figmaValue);
              } catch (error) {
                result.errors.push(
                  `Failed to set value for variable "${path}": ${error.message}`
                );
              }

              // Set values for other modes if they exist
              const modes = token.$extensions?.mode || token.extensions?.mode;
              if (modes && typeof modes === 'object') {
                for (const modeName in modes) {
                  const mode = collection!.modes.find(
                    (m) => m.name === modeName
                  );
                  if (mode) {
                    const modeValue = convertTokenValueToFigmaValue(
                      modes[modeName],
                      tokenType,
                      variableMap
                    );

                    try {
                      variable.setValueForMode(mode.modeId, modeValue);
                    } catch (error) {
                      result.errors.push(
                        `Failed to set value for mode "${modeName}" in variable "${path}": ${error.message}`
                      );
                    }
                  }
                }
              }
            }
          } catch (error) {
            result.errors.push(
              `Failed to set value for variable at path "${path}": ${error.message}`
            );
          }
        }
      } catch (error) {
        result.errors.push(
          `Failed to process collection "${collectionName}": ${error.message}`
        );
      }
    }

    // Third pass: resolve any remaining alias references that were stored as strings
    if (typeof figma !== 'undefined') {
      for (const [fullPath, variable] of variableMap) {
        try {
          // Get the fresh collection reference
          const collection =
            await figma.variables.getVariableCollectionByIdAsync(
              variable.variableCollectionId
            );

          if (!collection) continue;

          // Check each mode for unresolved aliases
          for (const mode of collection.modes) {
            const currentValue = variable.valuesByMode[mode.modeId];

            if (
              typeof currentValue === 'string' &&
              currentValue.startsWith('{') &&
              currentValue.endsWith('}')
            ) {
              // This is an unresolved alias
              const aliasPath = currentValue
                .slice(1, -1)
                .replace(/\.value$/, '');
              // Convert dots to slashes for Figma variable name format
              const figmaPath = aliasPath.replace(/\./g, '/');
              const referencedVariable = variableMap.get(figmaPath);

              if (referencedVariable) {
                const aliasValue: VariableAlias = {
                  type: 'VARIABLE_ALIAS',
                  id: referencedVariable.id,
                };

                try {
                  variable.setValueForMode(mode.modeId, aliasValue);
                } catch (error) {
                  result.errors.push(
                    `Failed to resolve alias for "${fullPath}": ${error.message}`
                  );
                }
              } else {
                result.errors.push(`Alias reference not found: ${aliasPath}`);
              }
            }
          }
        } catch (error) {
          result.errors.push(
            `Error in second pass for "${fullPath}": ${error.message}`
          );
        }
      }
    }

    result.success = true;
    const parts = [];
    if (result.collectionsCreated > 0) {
      parts.push(`Created ${result.collectionsCreated} collection(s)`);
    }
    if (result.variablesCreated > 0) {
      parts.push(`created ${result.variablesCreated} variable(s)`);
    }
    if (result.variablesUpdated > 0) {
      parts.push(`updated ${result.variablesUpdated} variable(s)`);
    }

    result.message = `Successfully imported tokens. ${parts.join(', ')}.`;

    if (result.errors.length > 0) {
      result.message += ` ${result.errors.length} error(s) occurred during import.`;
    }
  } catch (error) {
    result.success = false;
    result.message = `Import failed: ${error.message}`;
    result.errors.push(error.message);
  }

  return result;
};
