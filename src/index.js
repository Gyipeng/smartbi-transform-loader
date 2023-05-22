const loaderUtils = require('loader-utils')
const fs = require('fs')  // 调试用
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require("@babel/generator").default
module.exports = function changePrefixLoader(source) {
  const { prefix = 'el-', replace = 'ka-' } = loaderUtils.getOptions(this) || {}
  const result = handleSource(source, prefix, replace)
  // writeFile(result.code)
  return result.code
}
function handleSource(source, prefix, replace) {
    const ast = parser.parse(source)
    traverse(ast, {
      CallExpression(path) {
        path.traverse({
            Literal(path) {
                const node = path.node
                if (typeof node.value === 'string' && node.value.indexOf(prefix) !== -1 && !canChange(path)) {
                  if (node.value !== 'el-menu-collapse-transition') { // TODO 先特殊处理这个内部组件
                    const reg = new RegExp(`(^|(\\s)+|(\\.)+)${prefix}(?!icon)`, 'g')
                    node.value = node.value.replace(reg, `$1${replace}` )
                  }
                }
                path.replaceWith(node)
              },
              RegExpLiteral(path) {
                const node = path.node
                if (node.pattern.indexOf(prefix) !== -1) {
                  const reg = new RegExp(prefix, 'g')
                  node.extra.raw = node.extra.raw.replace(reg, replace)
                  node.pattern = node.pattern.replace(reg, replace)
                }
                path.replaceWith(node)
              }
            })
          }
        })
        return generate(ast)
      }
function canChange(path) {
    const parenNode = path.parent
    if (parenNode.type !== 'CallExpression') return false
    if (parenNode.callee && parenNode.callee.name === 'h' || parenNode.callee.name === '_c') {
        return true
    }
        return false
}
function writeFile(data) {
    fs.writeFile('log.js', data, (err) => {
      if (err) {
        throw Error(err)
      }
      console.log('write success');
    })
}