import React, { useState, useEffect } from 'react';

import { useDidUpdate } from './hooks/useDidUpdate';

import { LoadingView } from './views/LoadingView';
import { EmptyView } from './views/EmptyView';
import { SettingsView } from './views/SettingsView';

import { CodePreviewView } from './views/CodePreviewView';
import { importTokensFile } from './api/importTokensFile';

import styles from './styles.module.scss';

const Container = () => {
  const wrapperRef = React.useRef(null);

  const [generatedTokens, setGeneratedTokens] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [frameHeight, setFrameHeight] = useState(0);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);

  const [currentView, setCurrentView] = useState('main');
  const [fileHasVariables, setFileHasVariables] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [JSONsettingsConfig, setJSONsettingsConfig] = useState({
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
    variableCollections: [],
    storeStyleInCollection: 'none',
    colorMode: 'hex',
    includeScopes: false,
    useDTCGKeys: false,
    includeValueStringKeyToAlias: false,
    includeFigmaMetaData: false,
    usePercentageOpacity: false,
    splitByCollection: false,
    servers: {
      jsonbin: {
        isEnabled: false,
        id: '',
        name: '',
        secretKey: '',
      },
      github: {
        isEnabled: false,
        token: '',
        repo: '',
        branch: '',
        fileName: '',
        owner: '',
        commitMessage: '',
      },
      githubPullRequest: {
        isEnabled: false,
        token: '',
        repo: '',
        branch: '',
        baseBranch: '',
        fileName: '',
        owner: '',
        commitMessage: '',
      },
      gitlab: {
        isEnabled: false,
        host: '',
        token: '',
        repo: '',
        branch: '',
        fileName: '',
        owner: '',
        commitMessage: '',
      },
      customURL: {
        isEnabled: false,
        url: '',
        method: 'POST',
        headers: '',
      },
    },
  } as JSONSettingsConfigI);

  const commonProps = {
    JSONsettingsConfig,
    setJSONsettingsConfig,
    setCurrentView,
  };

  //////////////////////
  // HANDLE FUNCTIONS //
  //////////////////////

  const handleImportTokens = async () => {
    setIsImporting(true);

    try {
      const tokensData = await importTokensFile();

      if (tokensData) {
        // Send tokens to figma controller for import
        parent.postMessage(
          {
            pluginMessage: {
              type: 'importTokens',
              tokens: tokensData,
              role: 'import',
            } as TokensMessageI,
          },
          '*'
        );
      } else {
        setIsImporting(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setIsImporting(false);
    }
  };

  /////////////////
  // USE EFFECTS //
  /////////////////

  // Get all collections from Figma
  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'checkForVariables' } }, '*');

    window.onmessage = (event) => {
      const { type, hasVariables, variableCollections, storageConfig } =
        event.data.pluginMessage;

      // check if file has variables
      if (type === 'checkForVariables') {
        setFileHasVariables(hasVariables);
        setIsLoading(false);

        if (hasVariables) {
          setJSONsettingsConfig((prev) => ({
            ...prev,
            variableCollections,
          }));
        }
      }

      // check storage on load
      if (type === 'storageConfig') {
        if (storageConfig) {
          setJSONsettingsConfig((prev) => ({
            ...prev,
            ...storageConfig,
            // Ensure new properties have defaults for backward compatibility
            splitByCollection: storageConfig.splitByCollection ?? false,
          }));
        }
      }
    };
  }, []);

  // Check if the view was changed
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      setFrameHeight(height);

      if (isCodePreviewOpen) return;

      parent.postMessage(
        {
          pluginMessage: {
            type: 'resizeUIHeight',
            height,
          },
        },
        '*'
      );
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isCodePreviewOpen]);

  // pass changed to figma controller
  useDidUpdate(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'JSONSettingsConfig',
          config: JSONsettingsConfig,
        },
      },
      '*'
    );
  }, [JSONsettingsConfig]);

  // handle code preview
  useDidUpdate(() => {
    if (isCodePreviewOpen) {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'openCodePreview',
            isCodePreviewOpen,
            height: frameHeight,
          },
        },
        '*'
      );
    }
  }, [isCodePreviewOpen]);

  /////////////////////
  // RENDER FUNCTION //
  /////////////////////

  const renderView = () => {
    if (isLoading) {
      return <LoadingView />;
    }

    if (!fileHasVariables) {
      return (
        <EmptyView
          setFileHasVariables={setFileHasVariables}
          onImportTokens={handleImportTokens}
          isImporting={isImporting}
        />
      );
    }

    return (
      <SettingsView
        {...commonProps}
        isCodePreviewOpen={isCodePreviewOpen}
        setIsCodePreviewOpen={setIsCodePreviewOpen}
        setGeneratedTokens={setGeneratedTokens}
        currentView={currentView}
      />
    );
  };

  return (
    <div ref={wrapperRef} className={styles.container}>
      {renderView()}
      {isCodePreviewOpen && (
        <CodePreviewView generatedTokens={generatedTokens} />
      )}
    </div>
  );
};

export default Container;
