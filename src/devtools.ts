import * as L from "./index";

// The code below creates custom object formatter that works in Chrome
// DevTools.
// https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U

const listStyle = {
  style:
    "list-style-type: none; padding: 0; margin: 0 0 0 22px; font-style: normal"
};

// @ts-ignore
const gw = typeof window === undefined ? global : window;

if (gw.devtoolsFormatters === undefined) {
  gw.devtoolsFormatters = [];
}

function createReference(object: any): any {
  return ["object", { object }];
}

const l: L.List<string | { foo: 1 }> = L.list("hello", "world");
L.intersperse(", ", l);

gw.devtoolsFormatters.push({
  header: (l: any) => {
    if (L.isList(l)) {
      return [
        "div",
        { style: "font-style: italic" },
        ["span", {}, `(${l.length}) list(`],
        ...L.toArray(L.intersperse<any>(", ", L.map(createReference, l))),
        ["span", {}, `)`]
      ];
    } else {
      return null;
    }
  },
  hasBody: (l: L.List<any>) => {
    return l.length !== 0;
  },
  body: (l: L.List<any>) => {
    let idx = 0;
    const children = L.map(
      (o: any) => ["li", ["span", {}, idx++ + ": "], createReference(o)],
      l
    );
    return ["ol", listStyle, ...L.toArray(children)];
  }
});
