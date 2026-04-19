import { IResolver } from '@common/resolver';

export class PluginAPIResolver implements IResolver {
  async getLocalEffectStyles(): Promise<EffectStyle[]> {
    return figma.getLocalEffectStylesAsync();
  }

  async getLocalVariableCollections(): Promise<VariableCollection[]> {
    return figma.variables.getLocalVariableCollectionsAsync();
  }

  async getLocalVariables(): Promise<Variable[]> {
    return figma.variables.getLocalVariablesAsync();
  }

  async getLocalGridStyles(): Promise<GridStyle[]> {
    return figma.getLocalGridStylesAsync();
  }

  async getLocalTextStyles(): Promise<TextStyle[]> {
    return figma.getLocalTextStylesAsync();
  }

  async getLocalPaintStyles(): Promise<PaintStyle[]> {
    return figma.getLocalPaintStylesAsync();
  }

  async getVariableById(variableId: string): Promise<Variable | null> {
    return figma.variables.getVariableByIdAsync(variableId);
  }

  async getVariableCollectionById(
    id: string
  ): Promise<VariableCollection | null> {
    return figma.variables.getVariableCollectionByIdAsync(id);
  }
}
