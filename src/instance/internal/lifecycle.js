const dirRE = /^k-([^.:]+)/;

export default function (King) {
  King.prototype._compile = function (el) {
    compileRoot(el);
  };
}

function compileNode(node) {
  const type = node.nodeType;
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node);
  }
}

function compileRoot(el) {
  compileNode(el);
  compileNodeList(el.childNodes);
}

function compileNodeList(nodeList) {
  console.log(nodeList);
  Array.from(nodeList).forEach(node => {
    if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.hasChildNodes()) {
      compileNodeList(node.childNodes);
    }
    compileNode(node);
  })
}

function compileElement(el) {
  const attrs = Array.from(el.attributes);

  let name;
  let value;
  let expression;
  let dirName;
  attrs.forEach(attr => {
    name = attr.name;
    value = attr.value;
    if (name.match(dirRE)) {
      dirName = name.match(dirRE)[1];
    }
  })
}

function compileTextNode(node) {
  console.log('compile text node');
}