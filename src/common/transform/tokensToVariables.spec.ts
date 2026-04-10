import { describe, expect, test } from 'vitest';
import { getTokenScopes, isValidVariableScope } from './tokensToVariables';

describe('getTokenScopes', () => {
  test('returns scopes from standard format', () => {
    const token = { scopes: ['ALL_SCOPES'], value: '#fff', type: 'color' };
    expect(getTokenScopes(token)).toEqual(['ALL_SCOPES']);
  });

  test('returns undefined when no scopes key is present', () => {
    const token = { value: '#fff', type: 'color' };
    expect(getTokenScopes(token)).toBeUndefined();
  });

  test('returns undefined when scopes is not an array', () => {
    const token = { scopes: 'ALL_SCOPES', value: '#fff', type: 'color' };
    expect(getTokenScopes(token)).toBeUndefined();
  });

  test('returns empty array when scopes is an empty array', () => {
    const token = { scopes: [], value: '#fff', type: 'color' };
    expect(getTokenScopes(token)).toEqual([]);
  });

  test('does not read from $extensions.scopes (inconsistent with export)', () => {
    const token = {
      $extensions: { scopes: ['OPACITY'] },
      value: '#fff',
      type: 'color',
    };
    expect(getTokenScopes(token)).toBeUndefined();
  });
});

describe('isValidVariableScope', () => {
  test('returns true for valid scopes', () => {
    expect(isValidVariableScope('ALL_SCOPES')).toBe(true);
    expect(isValidVariableScope('OPACITY')).toBe(true);
    expect(isValidVariableScope('FONT_SIZE')).toBe(true);
    expect(isValidVariableScope('PARAGRAPH_INDENT')).toBe(true);
  });

  test('returns false for invalid scope strings', () => {
    expect(isValidVariableScope('INVALID_SCOPE')).toBe(false);
    expect(isValidVariableScope('')).toBe(false);
    expect(isValidVariableScope('all_scopes')).toBe(false); // case-sensitive
  });

  test('returns false for non-string values', () => {
    expect(isValidVariableScope(null)).toBe(false);
    expect(isValidVariableScope(undefined)).toBe(false);
    expect(isValidVariableScope(123)).toBe(false);
  });
});
