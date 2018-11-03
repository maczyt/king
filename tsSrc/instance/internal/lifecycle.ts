import Directive from "../../directive";

export default function(King) {
  King.prototype._compile = function(el: HTMLElement) {
    compileRoot(el, this);

    if (el.hasChildNodes()) {
      compileNodeList(el.childNodes, this);
    }
  };
}

function compileRoot(el, vm) {
  compileNode(el, vm);
}

function compileNodeList(nodeList: NodeList, vm) {
  toArray(nodeList).forEach(node => {
    compileNode(node, vm);
    if (
      node.nodeType === 1 &&
      node["tagName"] !== "SCRIPT" &&
      node.hasChildNodes()
    ) {
      compileNodeList(node.childNodes, vm);
    }
  });
}

function compileNode(node, vm) {
  const type = node.nodeType;
  if (type === 1 && node.tagName !== "SCRIPT") {
    compileElement(node, vm);
  } else if (type === 3 && node.data.trim()) {
    compileTextNode(node, vm);
  }
}

function compileElement(el, vm) {
  let attrs = el.attributes;
  parseDirectives(attrs, el, vm);
}

function compileTextNode(textNode, vm) {}

function parseDirectives(attrs, el, vm: KingIF) {
  const dirRE = /k-([^.:]+)/;
  let dir;
  let dirs = [];
  let name;
  let expression;
  let dirName;
  let matched;
  toArray(attrs).forEach(attr => {
    name = attr.name;
    expression = attr.value;

    if ((matched = name.match(dirRE))) {
      // 匹配到指令
      dirName = matched[1];
      dir = new Directive(dirName, expression, el, vm);
      dirs.push(dir);
    }
  });

  dirs.forEach(dir => {
    dir._bind();
  });
}

function toArray(arr) {
  let i = arr.length;
  let res = [];
  while (i--) {
    res[i] = arr[i];
  }
  return res;
}
