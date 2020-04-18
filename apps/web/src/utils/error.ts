import { ApolloError } from '@apollo/client';

export function extractGraphqlErrorMessage(error: ApolloError): string {
  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }
  return 'Something goes wrong, please try again later.';
}
