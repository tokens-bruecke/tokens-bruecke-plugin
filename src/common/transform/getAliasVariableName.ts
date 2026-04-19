import { getTokenKeyName } from './getTokenKeyName';
import { IResolver } from '../resolver';

export const getAliasVariableName = async (
  variableId: string,
  isDTCGForamt: boolean,
  includeValueStringKeyToAlias: boolean,
  resolver: IResolver,
  omitCollectionNames = false
) => {
  const variableObj = await resolver.getVariableById(variableId) as Variable | null;
  if (!variableObj) {
    console.log('cannot find variable', variableId);
    return '#missing#';
  }
  const collectionObj = await resolver.getVariableCollectionById(
    variableObj.variableCollectionId
  ) as VariableCollection | null;

  const variableName = variableObj.name;
  const collectionName = collectionObj.name;

  const valueKey = getTokenKeyName(isDTCGForamt).value;
  const isValueKeyIncluded = includeValueStringKeyToAlias ? `.${valueKey}` : '';

  const variableParts = variableName.split('/');

  const aliasName = omitCollectionNames
    ? `{${variableParts.join('.')}${isValueKeyIncluded}}`
    : `{${collectionName}.${variableParts.join('.')}${isValueKeyIncluded}}`;

  return aliasName;
};
