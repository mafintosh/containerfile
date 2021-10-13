module.exports = stringify

function stringify (parsed) {
  return parsed.map(function (cmd) {
    var prefix = cmd.force ? 'FORCE ' : ''

    switch (cmd.type) {
      case 'from':
        if (cmd.path) return prefix + 'FROM ' + JSON.stringify(cmd.path) + '\n'
        return prefix + 'FROM ' + cmd.image + (cmd.version ? ':' + cmd.version : '') + '\n'
      case 'run':
        return prefix + 'RUN ' + cmd.command + '\n'
      case 'cmd':
        return prefix + 'CMD ' + cmd.command + '\n'
      case 'mount':
        return prefix + 'MOUNT ' + cmd.command + '\n'
      case 'env':
        return prefix + 'ENV ' + cmd.env.map(toKeyValue).join(' ') + '\n'
      case 'arg':
        return prefix + 'ARG ' + cmd.key + (cmd.value ? '=' + JSON.stringify(cmd.value) : '') + '\n'
      case 'copy':
        return prefix + 'COPY ' + JSON.stringify(cmd.from) + ' ' + JSON.stringify(cmd.to) + '\n'
      default:
        throw new Error('Unknown type: ' + cmd.type)
    }
  }).join('')
}

function toKeyValue (env) {
  return env.key + '=' + JSON.stringify(env.value)
}
