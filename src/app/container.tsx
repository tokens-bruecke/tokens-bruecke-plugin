import React, { useState, useEffect } from 'react';

import { useDidUpdate } from './hooks/useDidUpdate';

import { LoadingView } from './views/LoadingView';
import { EmptyView } from './views/EmptyView';
import { SettingsView } from './views/SettingsView';

import { CodePreviewView } from './views/CodePreviewView';
import { importTokensFile } from './api/importTokensFile';

import styles from './styles.module.scss';

const Container = () => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const [generatedTokens, setGeneratedTokens] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [frameHeight, setFrameHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [manualFrameHeight, setManualFrameHeight] = useState<number | null>(
    null
  );
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
    omitCollectionNames: false,
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

      // Don't track content height while preview is open — the flex row
      // includes the preview pane and doesn't represent SettingsView height.
      if (isCodePreviewOpen) return;

      setContentHeight(height);
      setFrameHeight(height);

      if (manualFrameHeight !== null) return;

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
  }, [isCodePreviewOpen, manualFrameHeight]);

  useEffect(() => {
    if (manualFrameHeight === null) {
      return;
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'resizeUIHeight',
          height: manualFrameHeight,
        },
      },
      '*'
    );
  }, [manualFrameHeight]);

  useEffect(() => {
    if (manualFrameHeight === null || contentHeight <= 0) {
      return;
    }

    const maxHeight = Math.max(360, Math.round(contentHeight));

    if (manualFrameHeight > maxHeight) {
      setManualFrameHeight(maxHeight);
      setFrameHeight(maxHeight);
    }
  }, [manualFrameHeight, contentHeight]);

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
    parent.postMessage(
      {
        pluginMessage: {
          type: 'openCodePreview',
          isCodePreviewOpen,
          height: manualFrameHeight ?? frameHeight,
        },
      },
      '*'
    );
  }, [isCodePreviewOpen]);

  const handleResizeHeight = (height: number) => {
    const maxHeight = Math.max(360, Math.round(contentHeight || frameHeight));
    const nextHeight = Math.round(Math.max(360, Math.min(height, maxHeight)));
    setManualFrameHeight(nextHeight);
    setFrameHeight(nextHeight);
  };

  const handleResetHeight = () => {
    const nextHeight = Math.max(360, Math.round(contentHeight));
    setManualFrameHeight(null);
    setFrameHeight(nextHeight);

    parent.postMessage(
      {
        pluginMessage: {
          type: 'resizeUIHeight',
          height: nextHeight,
        },
      },
      '*'
    );
  };

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
        frameHeight={manualFrameHeight ?? frameHeight}
        onResizeHeight={handleResizeHeight}
        onResetHeight={handleResetHeight}
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
