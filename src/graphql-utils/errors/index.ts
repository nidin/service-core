export type RawGraphQLError = {
  message: string;
  extensions: {
    [key: string]: any;
    code: string;
    exception: {
      reason: any;
      stacktrace: string[];
    };
  };
};

export class GraphQLBaseError extends Error {
  code: string;
  statusCode: number;
  reason: any;
  constructor(error: RawGraphQLError, name: string) {
    super(error.message);
    this.name = name;
    this.code = error.extensions.code;
    this.statusCode = 500;
    this.stack = error.extensions.exception.stacktrace.join("\n");
    this.reason = error.extensions.exception.reason || {
      message: error.message
    };
  }

  toString(): string {
    return `${super.name}: ${this.message}, reason: ${this.reason}`;
  }
}

export class GraphQLError extends GraphQLBaseError {
  constructor(error: RawGraphQLError) {
    super(error, GraphQLError.prototype.constructor.name);
  }
}

export class GraphQLEngineError extends GraphQLBaseError {
  constructor(error: RawGraphQLError) {
    super(error, GraphQLEngineError.prototype.constructor.name);
  }
}
