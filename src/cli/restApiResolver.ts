import { TextNode, type LocalVariable } from '@figma/rest-api-spec';
import { IResolver } from '@common/resolver';
import { Api } from 'figma-api';

export class RestAPIResolver implements IResolver {
  private fileKey: string;
  private api: Api;
  private variables: Record<string, Variable>;
  private variableCollections: Record<string, VariableCollection>;
  private styles: any[];

  private fetchLocalVariablesPromise: Promise<void> | null = null;

  constructor(
    fileKey: string,
    personalAccessToken?: string,
    oAuthToken?: string
  ) {
    this.fileKey = fileKey;
    if (oAuthToken) {
      this.api = new Api({ oAuthToken });
    } else if (personalAccessToken) {
      this.api = new Api({ personalAccessToken });
    } else {
      throw new Error(
        'Either personalAccessToken or oAuthToken must be provided'
      );
    }
    this.styles = [];
  }

  async fetchLocalVariables(): Promise<void> {
    if (!this.variables) {
      if (!this.fetchLocalVariablesPromise) {
        console.log('⌛ Fetching local variables');
        this.fetchLocalVariablesPromise = this.api
          .getLocalVariables({ file_key: this.fileKey })
          .then((response) => {
            const { variables, variableCollections } = response.meta;
            this.variables = Object.fromEntries(
              Object.entries(variables).filter(
                ([_, variable]: [string, LocalVariable]) =>
                  !variable.remote && !variable.deletedButReferenced // exlude deleted variables https://forum.figma.com/ask-the-community-7/rest-api-variables-35406?tid=35406&fid=7
              )
            ) as Record<string, Variable>;
            this.variableCollections = Object.fromEntries(
              Object.entries(variableCollections).filter(
                ([_, collection]: [string, VariableCollection]) =>
                  !collection.remote && !collection.hiddenFromPublishing
              )
            ) as Record<string, VariableCollection>;
            console.log(
              '✅ Found %d local variables in %d collections',
              Object.keys(this.variables).length,
              Object.keys(this.variableCollections).length
            );
          })
          .catch((error) => {
            throw error;
          });
      }
      await this.fetchLocalVariablesPromise;
    }
  }

  async fetchFileStyles(): Promise<void> {
    if (this.styles.length === 0) {
      // Fetch file styles only if they are not already fetched
      console.log('⌛ Fetching file styles');
      const styles = await this.api.getFileStyles({
        file_key: this.fileKey,
      });
      this.styles = styles.meta.styles;
    }
  }

  async getLocalEffectStyles(): Promise<EffectStyle[]> {
    await this.fetchFileStyles();
    console.log('⌛ Fetching text styles');
    const ids = this.styles
      .filter((style) => style.style_type === 'EFFECT')
      .map((style) => style.node_id);
    const r = await this.api.getFileNodes(
      { file_key: this.fileKey },
      { ids: ids.join(',') }
    );
    const effectStyles = Object.values(r.nodes)
      .map((node) => node.document as unknown as RectangleNode)
      .map(this.rectangleNodeToEffectStyle);
    console.log('✅ Found %d effect styles', effectStyles.length);
    return effectStyles;
  }

  async getLocalVariableCollections(): Promise<VariableCollection[]> {
    await this.fetchLocalVariables();
    return Object.values(this.variableCollections);
  }

  async getLocalVariables(): Promise<Variable[]> {
    await this.fetchLocalVariables();
    return Object.values(this.variables);
  }

  async getLocalGridStyles(): Promise<GridStyle[]> {
    await this.fetchFileStyles();
    console.log('⌛ Fetching grid styles');
    const ids = this.styles
      .filter((style) => style.style_type === 'GRID')
      .map((style) => style.node_id);
    const r = await this.api.getFileNodes(
      { file_key: this.fileKey },
      { ids: ids.join(',') }
    );
    const gridStyles = Object.values(r.nodes)
      .map((node) => node.document as unknown as FrameNode)
      .map(this.frameNodeToGrid);
    console.log('✅ Found %d grid styles', gridStyles.length);
    return gridStyles;
  }

  async getLocalTextStyles(): Promise<TextStyle[]> {
    await this.fetchFileStyles();
    console.log('⌛ Fetching text styles');
    const ids = this.styles
      .filter((style) => style.style_type === 'TEXT')
      .map((style) => style.node_id);
    const r = await this.api.getFileNodes(
      { file_key: this.fileKey },
      { ids: ids.join(',') }
    );
    const textStyles = Object.values(r.nodes)
      .map((node) => node.document as TextNode)
      .map(this.textNodeToStyle);
    console.log('✅ Found %d text styles', textStyles.length);
    return textStyles;
  }

  async getLocalPaintStyles(): Promise<PaintStyle[]> {
    await this.fetchFileStyles();
    console.log('⌛ Fetching paint styles');
    const ids = this.styles
      .filter((style) => style.style_type === 'FILL')
      .map((style) => style.node_id);
    const r = await this.api.getFileNodes(
      { file_key: this.fileKey },
      { ids: ids.join(',') }
    );
    const paintStyles = Object.values(r.nodes)
      .map((node) => node.document as unknown as RectangleNode)
      .map(this.rectangleNodeToPaint);
    console.log('✅ Found %d paint styles', paintStyles.length);
    return paintStyles;
  }

  async getVariableById(variableId: string): Promise<Variable | null> {
    // Assuming variables are fetched and stored
    return this.variables[variableId] || null;
  }

  async getVariableCollectionById(
    id: string
  ): Promise<VariableCollection | null> {
    return this.variableCollections[id] || null;
  }

  rectangleNodeToEffectStyle(node: RectangleNode): EffectStyle {
    return {
      type: 'EFFECT',
      id: node.id,
      name: node.name,
      effects: node.effects,
      remote: false,
      key: node.id,
      description: '',
      documentationLinks: [],
      consumers: [],
      boundVariables: node.boundVariables,
    } as unknown as EffectStyle;
  }

  frameNodeToGrid(node: FrameNode): GridStyle {
    return {
      type: 'GRID',
      id: node.id,
      name: node.name,
      layoutGrids: node.layoutGrids,
      remote: false,
      key: node.id,
      description: '',
      documentationLinks: [],
      consumers: [],
      boundVariables: node.boundVariables,
    } as unknown as GridStyle;
  }

  textNodeToStyle(node: TextNode): TextStyle {
    return {
      type: 'TEXT',
      id: node.id,
      remote: false,
      key: node.id,
      name: node.name,
      documentationLinks: [],
      consumers: [],
      boundVariables: node.boundVariables,
      fontName: {
        family: node.style.fontFamily,
        style: node.style.fontStyle,
      },
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      textDecoration: node.style.textDecoration,
      textCase: node.style.textCase,
      paragraphIndent: node.style.paragraphIndent ?? 0,
      paragraphSpacing: node.style.paragraphSpacing ?? 0,
      listSpacing: node.style.listSpacing,
      hangingList: false, //not in API ?
      hangingPunctuation: false, //not in API ?
      leadingTrim: 'NONE', //not in API ?
      letterSpacing: { value: node.style.letterSpacing, unit: 'PIXELS' },
      lineHeight: {
        value:
          node.style.lineHeightUnit == 'PIXELS'
            ? node.style.lineHeightPx
            : node.style.lineHeightPercentFontSize,
        unit: node.style.lineHeightUnit == 'PIXELS' ? 'PIXELS' : 'PERCENT',
      },
    } as unknown as TextStyle;
  }

  rectangleNodeToPaint(node: RectangleNode): PaintStyle {
    return {
      type: 'PAINT',
      id: node.id,
      name: node.name,
      paints: node.fills as Paint[],
      remote: false,
      key: node.id,
      description: '',
      documentationLinks: [],
      consumers: [],
    } as unknown as PaintStyle;
  }
}
