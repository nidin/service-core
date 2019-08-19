import { encode, decode } from "he";
import { GraphQLScalarType } from "graphql";

export const UnicodeString = new GraphQLScalarType({
  name: "UnicodeString",
  description: "Strings containing unicode codes rather than html entities",
  parseValue(value) {
    return encode(value, { useNamedReferences: true });
  },
  parseLiteral(ast) {
    return encode((ast.kind === "StringValue" && ast.value) as string, {
      useNamedReferences: true
    });
  },
  serialize(value) {
    return decode(value);
  }
});
