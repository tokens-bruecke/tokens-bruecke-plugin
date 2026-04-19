import React from 'react';

import styles from './styles.module.scss';

import { getTokensStat } from '@common/transform/getTokensStat';

import { Text, Icon } from 'react-figma-ui/ui';

interface CodePreviewViewProps {
  generatedTokens: any;
}

const copy = require('clipboard-copy');

export const CodePreviewView = ({ generatedTokens }: CodePreviewViewProps) => {
  const [isUpdateButtonAnimated, setIsUpdateButtonAnimated] =
    React.useState<boolean>(false);
  const [tokensStat, setTokensStat] = React.useState<any>(null);
  const [isCodeCopied, setIsCodeCopied] = React.useState<boolean>(false);

  const getTokensPreview = () => {
    // send command to figma controller
    parent.postMessage(
      {
        pluginMessage: {
          type: 'getTokens',
          role: 'preview',
        } as TokensMessageI,
      },
      '*'
    );

    // start animation
    setIsUpdateButtonAnimated(true);

    // stop animation
    setTimeout(() => {
      setIsUpdateButtonAnimated(false);
    }, 500);
  };

  const copyCode = () => {
    // copy code to clipboard
    copy(JSON.stringify(generatedTokens, null, 2));
    setIsCodeCopied(true);

    // stop animation
    setTimeout(() => {
      setIsCodeCopied(false);
    }, 2000);
  };

  React.useEffect(() => {
    if (generatedTokens) {
      setTokensStat(getTokensStat(generatedTokens));
    }
  }, [generatedTokens]);

  if (!tokensStat || !generatedTokens) {
    return null;
  }

  return (
    <section className={styles.codePreview}>
      <section className={styles.previewToolbar}>
        <button
          className={`${styles.toolbarItem} ${styles.previewToolbarButton} ${
            isUpdateButtonAnimated ? styles.successUpdateAnimation : ''
          }`}
          onClick={getTokensPreview}
        >
          <Icon name="refresh" size="16" />
          <Text>Update</Text>
        </button>

        <button
          className={`${styles.toolbarItem} ${styles.previewToolbarSecondButton}`}
          onClick={copyCode}
        >
          <Text>{isCodeCopied ? 'Copied!' : 'Copy'}</Text>
        </button>

        <div className={`${styles.toolbarItem} ${styles.previewToolbarStat}`}>
          <Text>
            {tokensStat.tokensCount} tokens, {tokensStat.groupsCount} groups,{' '}
            {tokensStat.codeLines} lines
          </Text>
        </div>

        <div className={`${styles.toolbarItem} ${styles.previewToolbarStat}`}>
          <Text>{tokensStat.size / 1000} KB</Text>
        </div>
      </section>

      <pre>
        <code>{JSON.stringify(generatedTokens, null, 2)}</code>
      </pre>
    </section>
  );
};
