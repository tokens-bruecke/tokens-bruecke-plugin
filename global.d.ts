/// <reference path="./node_modules/@figma/plugin-typings/index.d.ts" />

type nameConventionType =
  | 'none'
  | 'PascalCase'
  | 'camelCase'
  | 'snake_case'
  | 'kebab-case'
  | 'UPPERCASE'
  | 'lowercase'
  | 'MACRO_CASE'
  | 'COBOL-CASE'
  | 'Cobol case'
  | 'Ada_Case'
  | 'dot.notation';

type colorModeType =
  | 'hex'
  | 'rgba-object'
  | 'rgba-css'
  | 'hsla-object'
  | 'hsla-css';

type stylesType = 'text' | 'colors' | 'effects' | 'grids';

type variableFeatureType = 'scope' | 'hidden';

type JSONSettingsStyleType = {
  isIncluded: boolean;
  customName: string;
};

interface IncludedStylesI {
  text: JSONSettingsStyleType;
  effects: JSONSettingsStyleType;
  grids: JSONSettingsStyleType;
  colors: JSONSettingsStyleType;
}

interface JsonbinCredentialsI {
  isEnabled: boolean;
  id?: string;
  name: string;
  secretKey: string;
}

interface GithubCredentialsI {
  isEnabled: boolean;
  token: string;
  repo: string;
  branch: string;
  fileName: string;
  owner: string;
  commitMessage?: string;
}

interface GithubPullRequestCredentialsI {
  isEnabled: boolean;
  token: string;
  repo: string;
  baseBranch: string;
  branch: string;
  fileName: string;
  owner: string;
  commitMessage?: string;
  pullRequestTitle?: string;
  pullRequestBody?: string;
}

interface GitlabCredentialsI {
  isEnabled: boolean;
  owner: string;
  host: string;
  repo: string;
  branch: string;
  fileName: string;
  token: string;
  commitMessage?: string;
}

interface CustomURLCredentialsI {
  isEnabled: boolean;
  url: string;
  method: 'POST' | 'PUT';
  headers: string;
}

interface ExportSettingsI {
  includedStyles: IncludedStylesI;
  includeScopes: boolean;
  useDTCGKeys: boolean;
  includeValueStringKeyToAlias: boolean;
  colorMode: colorModeType;
  storeStyleInCollection: string;
  includeFigmaMetaData: boolean;
  usePercentageOpacity: boolean;
  splitByCollection: boolean;
}

interface ServerSettingsI {
  jsonbin: JsonbinCredentialsI;
  github: GithubCredentialsI;
  githubPullRequest: GithubPullRequestCredentialsI;
  gitlab: GitlabCredentialsI;
  customURL: CustomURLCredentialsI;
}
type PluginStateI = {
  variableCollections: string[];
};

type JSONSettingsConfigI = ExportSettingsI &
  PluginStateI & {
    servers: ServerSettingsI;
  };

interface PluginTokenI {
  $value: string;
  $type: TokenType;
  $description: string;
  scopes?: VariableScope[];
  $extensions: {
    mode: Object;
    figma?: {
      variableId: string;
      codeSyntax: {
        WEB?: string;
        iOS?: string;
        ANDROID?: string;
      };
      collection: {
        id: string;
        name: string;
        defaultModeId: string;
      };
    };
  };
}

type ServerType =
  | 'jsonbin'
  | 'github'
  | 'githubPullRequest'
  | 'gitlab'
  | 'bitbucket'
  | 'customURL'
  | 'none';

interface TokensMessageI {
  type: 'getTokens' | 'setTokens' | 'importTokens' | 'importResult';
  tokens: any;
  role: 'preview' | 'push' | 'download' | 'import';
  server: ServerType[];
  result?: {
    success: boolean;
    message: string;
    collectionsCreated: number;
    variablesCreated: number;
    errors: string[];
  };
}

interface MetaPropsI {
  useDTCGKeys: boolean;
  colorMode: colorModeType;
  variableCollections: string[] | undefined;
  createdAt: string;
}

interface ToastIPropsI {
  title: string;
  message: string;
  options: {
    type?: 'success' | 'error' | 'warn' | 'info';
    timeout?: number;
    onClose?: () => void;
  };
}

// Extend Figmas PaintStyle interface
interface PaintStyleExtended extends PaintStyle {
  readonly boundVariables?: {
    readonly paints: VariableAlias[];
  };
}
