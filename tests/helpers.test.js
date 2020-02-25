/* eslint-disable no-template-curly-in-string */
const helpers = require("../helpers");

describe("Dehash", () => {
  test("Dehash #martengooz to equal martengooz", () => {
    expect(helpers.dehash("#martengooz")).toBe("martengooz");
  });

  test("Dehash martengooz to equal martengooz", () => {
    expect(helpers.dehash("martengooz")).toBe("martengooz");
  });

  test("Dehash empty string to equal empty string", () => {
    expect(helpers.dehash("")).toBe("");
  });
});

describe("Detag", () => {
  test("Detag @martengooz to equal martengooz", () => {
    expect(helpers.detag("@martengooz")).toBe("martengooz");
  });

  test("Detag martengooz to equal martengooz", () => {
    expect(helpers.detag("martengooz")).toBe("martengooz");
  });

  test("Detag empty string to equal empty string", () => {
    expect(helpers.detag("")).toBe("");
  });
});

describe("Replace in message", () => {
  test("with empty string returns empty string", () => {
    const replacement = "replaced string";
    expect(helpers.replaceInMessage("", { replacement: replacement })).toBe("");
  });

  test("with no replacements in string return same string", () => {
    expect(helpers.replaceInMessage("Simple string.")).toBe("Simple string.");
  });

  test("with a single variable in string replaces the variable", () => {
    const replacement = "replaced string";
    expect(helpers.replaceInMessage("${string}", { string: replacement })).toBe(
      "replaced string"
    );
  });

  test("with a single variable in mixed string replaces the variable", () => {
    const replacement = "replaced string";
    expect(
      helpers.replaceInMessage("Simple ${string}", { string: replacement })
    ).toBe("Simple replaced string");
  });

  test("with multiple of a same variable in string replaces all occurances", () => {
    const replacement = "replaced string";
    expect(
      helpers.replaceInMessage("Simple ${string} ${string} ${string}", {
        string: replacement
      })
    ).toBe("Simple replaced string replaced string replaced string");
  });

  test("with different variables in string replaces all variables", () => {
    const replacement1 = "one";
    const replacement2 = "two";
    expect(
      helpers.replaceInMessage("${replacement1} ${replacement2}", {
        replacement1: replacement1,
        replacement2: replacement2
      })
    ).toBe("one two");
  });

  test("with different variables in string with no spaces replaces all variables", () => {
    const replacement1 = "one";
    const replacement2 = "two";
    expect(
      helpers.replaceInMessage("${replacement1}${replacement2}", {
        replacement1: replacement1,
        replacement2: replacement2
      })
    ).toBe("onetwo");
  });

  test("don't replace anything if variable does not exist.", () => {
    const replacement = "one";
    expect(
      helpers.replaceInMessage("${not_replaced}", { replacement: replacement })
    ).toBe("${not_replaced}");
  });
});
