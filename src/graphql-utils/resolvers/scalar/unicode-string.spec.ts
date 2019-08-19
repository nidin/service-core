import { UnicodeString } from "./unicode-string";

describe("Unicode String Scalar", () => {
  const htmlEntityValue = "Foo&shy;Bar";
  const unicodeValue = "Foo\u00adBar";

  it("should parse the value correctly", () => {
    expect(UnicodeString.parseValue(unicodeValue)).toBe(htmlEntityValue);
  });
  it("should parse the literal correctly", () => {
    expect(
      UnicodeString.parseLiteral(
        { value: unicodeValue, kind: "StringValue" },
        {}
      )
    ).toBe(htmlEntityValue);
  });
  it("should serialize the literal correctly", () => {
    expect(UnicodeString.serialize(htmlEntityValue)).toEqual(unicodeValue);
  });
});
