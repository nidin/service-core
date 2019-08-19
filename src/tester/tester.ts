/* istanbul ignore file */
import * as path from "path";
import { ApolloClient } from "apollo-client";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";
import { SchemaLink } from "apollo-link-schema";
import { DocumentNode, OperationDefinitionNode, GraphQLSchema } from "graphql";
import { buildFederatedSchema } from "@apollo/federation";

let client: ApolloClient<any>;

const cwd = process.cwd();

type SchemaProps = {
  typeDefs: any;
  resolvers: any;
};

function setup({ typeDefs, resolvers }: SchemaProps) {
  const schema: GraphQLSchema = buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]);

  const data: any = __non_webpack_require__(
    path.resolve(cwd, "./__testdata__/fragmentTypes.json")
  );
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: data
  });

  const cache = new InMemoryCache({
    fragmentMatcher,
    dataIdFromObject: (object: any) => object.key || null
  });

  client = new ApolloClient({
    cache,
    link: new SchemaLink({ schema })
  });
}
type Throws = { not?: boolean; error?: any } | boolean | null;
export type BaseCase = {
  name: string;
  query: DocumentNode;
  expectedData: any;
  variables?: any;
  throws?: Throws;
  context?: any;
};

export const basecase = ({
  name,
  variables = {},
  query,
  expectedData: data,
  throws = null
}: BaseCase) => ({
  name,
  query,
  variables,
  throws,
  expected: { data },
  context: {},
});

const executeQuery = async (queryDoc: DocumentNode, variables: any) => {
  const [def] = <OperationDefinitionNode[]>queryDoc.definitions;
  switch (def.operation) {
    case "mutation": {
      return client.mutate({
        variables,
        mutation: queryDoc
      });
    }
    case "query": {
      return client.query({
        variables,
        query: queryDoc
      });
    }
  }
  return null;
};

function castToArray(testcasesObject: any) {
  const caseNames = Object.keys(testcasesObject);
  return caseNames.map(name => ({
    caseName: name,
    ...testcasesObject[name]
  }));
}

type Mock = {
  module: string;
  impl: any;
};

type TestCaseInfo = {
  name: string;
  caseName: string;
  expected: any;
  throws: Throws;
  promise: Promise<any>;
};

export const Tester = {
  test: (testcases: any, schemaProps: SchemaProps, mocks: Mock[] = []) => {
    if (mocks.length > 0) {
      mocks.forEach(mock => {
        jest.mock(mock.module, () => mock.impl);
      });
    }
    setup(schemaProps);
    const testinfo: TestCaseInfo[] = [];
    let _testcases = testcases
    if (!Array.isArray(testcases) && typeof testcases === "object") {
      _testcases = castToArray(testcases);
    }
    _testcases.forEach((testcase: any) => {
      const {
        name,
        caseName = "",
        query,
        variables,
        expected,
        throws
      } = testcase;
      const promise = executeQuery(query, variables);
      testinfo.push({ name, caseName, expected, throws, promise });
    });

    testinfo.forEach(({ name, caseName, expected, throws, promise }) => {
      test(`${caseName ? `[${caseName}] ` : ""}query: ${name}`, async () => {
        if (throws) {
          if (typeof throws === "object") {
            if (throws.not) {
              await expect(promise).resolves.not.toThrow();
            } else {
              const { error } = throws;
              if (error) {
                await expect(promise).rejects.toThrowError(error);
              } else {
                await expect(promise).rejects.toThrow();
              }
            }
          } else {
            await expect(promise).rejects.toThrow();
          }
        } else {
          const result = await promise;
          expect(result).toEqual({
            ...expected,
            ...(result.networkStatus
              ? { loading: false, networkStatus: 7, stale: false }
              : {})
          });
        }
      });
    });
  }
};
