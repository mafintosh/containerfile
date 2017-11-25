# containerfile

Containerfile parser and stringifier

```
npm install containerfile
```

## Usage

``` js
var containerfile = require('containerfile')

var parsed = containerfile.parse(`
  FROM ubuntu:xenial
  RUN rm -f /etc/resolv.conf && echo '8.8.8.8' > /etc/resolv.conf
  RUN apt-get update
  RUN apt-get install -y git vim curl
  RUN curl -fs https://raw.githubusercontent.com/mafintosh/node-install/master/install | sh
  RUN node-install 8.9.1
`)

// prints the parsed file
console.log(parsed)

// serializes it again
console.log(containerfile.stringify(parsed))
```

## Syntax

The format is similar to a `Dockerfile`.

```
FROM os:version
RUN shell-command
COPY from/local/file /to/container/path
ENV key=value key2=value2
```

Alternatively if you are referencing another `Containerfile` or disk image you can do

```
FROM ./path/to/disk/image/or/containerfile
```

If your shell command is long you can split it into multiple lines using the familiar `\\` syntax

```
RUN apt-get update && \\
  apt-get install -y git vim curl
```

To comment out a line add `#` infront.

To force run a command (i.e. cache bust it) you can prefix any command with `FORCE`.

## API

#### `var parsed = containerfile.parse(string)`

Parse the content of a `Containerfile`. 
Returns an array of objects, each representing a line.

``` js
// FROM os:version
{
  type: 'from',
  image: 'os',
  version: 'version',
  path: null
}

// FROM ./path
{
  type: 'from',
  image: null,
  version: null,
  path: './path'
}

// RUN command
{
  type: 'run',
  command: 'command'
}

// COPY from to
{
  type: 'copy',
  from: 'from',
  to: 'to'
}

// ENV key=value key2="value 2" ...
{
  type: 'env',
  env: [{
    key: 'key',
    value: 'value'
  }, {
    key: 'key2',
    value: 'value 2'
  }]
}
```

If a command is prefixed with `FORCE`, `force: true` will be set on the object.

#### `var str = containerfile.stringify(parsed)` 

Serialize a parsed object back to the `Containerfile` format

## License

MIT
