import Directive from '../../directive/index';

const dirRE = /^k-([^.:]+)/;

export default function (King) {
  King.prototype._compile = function (el) {
    compileRoot(el, this);
  };
}

function compileNode(node, vm) {
  const type = node.nodeType;
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, vm);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, vm);
  }
}

function compileRoot(el, vm) {
  compileNode(el, vm);
  compileNodeList(el.childNodes, vm);
}

function compileNodeList(nodeList, vm) {
  Array.from(nodeList).forEach(node => {
    compileNode(node, vm);
    if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.hasChildNodes()) {
      compileNodeList(node.childNodes, vm);
    }
  })
}

function compileElement(el, vm) {
  const attrs = Array.from(el.attributes);

  let name;
  let value;
  let expression;
  let dirName;
  let dirs = [];
  let dir;
  attrs.forEach(attr => {
    name = attr.name;
    value = attr.value;
    expression = value;
    if (name.match(dirRE)) {
      dirName = name.match(dirRE)[1];
      dir = new Directive(dirName, expression, el, vm);
      dirs.push(dir);
    }
  });

  if (dirs.length) {
    dirs.forEach(dir => {
      dir._bind();
    })
  }
}

function compileTextNode(node, vm) {
  console.log('compile text node');
}