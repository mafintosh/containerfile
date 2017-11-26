var tape = require('tape')
var parse = require('./parse')
var stringify = require('./stringify')

tape('parses', function (t) {
  var parsed = parse(`
    FROM ubuntu:precise
    RUN rm -f /etc/resolv.conf && echo '8.8.8.8' > /etc/resolv.conf
    RUN apt-get update
    RUN apt-get install -y python-software-properties && \\
      add-apt-repository -y ppa:ubuntu-toolchain-r/test && \\
      apt-get update
    RUN apt-get install -y g++-4.8 g++-4.8-multilib gcc-4.8-multilib && \\
      update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 50
    RUN foo \\
      bar \\
      baz
    COPY ./start.js /root/start.js
    COPY "./start.js" /root/start.js
    COPY " a b c " 'd e f'
    COPY foo\\ bar.js baz
  `)

  var expected = [{
    type: 'from',
    image: 'ubuntu',
    version: 'precise',
    path: null
  }, {
    type: 'run',
    command: 'rm -f /etc/resolv.conf && echo \'8.8.8.8\' > /etc/resolv.conf'
  }, {
    type: 'run',
    command: 'apt-get update'
  }, {
    type: 'run',
    command: 'apt-get install -y python-software-properties && add-apt-repository -y ppa:ubuntu-toolchain-r/test && apt-get update'
  }, {
    type: 'run',
    command: 'apt-get install -y g++-4.8 g++-4.8-multilib gcc-4.8-multilib && update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 50'
  }, {
    type: 'run',
    command: 'foo bar baz'
  }, {
    type: 'copy',
    from: './start.js',
    to: '/root/start.js'
  }, {
    type: 'copy',
    from: './start.js',
    to: '/root/start.js'
  }, {
    type: 'copy',
    from: ' a b c ',
    to: 'd e f'
  }, {
    type: 'copy',
    from: 'foo bar.js',
    to: 'baz'
  }]

  t.same(parsed.length, expected.length)
  for (var i = 0; i < parsed.length; i++) {
    t.same(parsed[i], expected[i])
  }
  t.end()
})

tape('force', function (t) {
  t.same(parse('FORCE RUN foo'), [{type: 'run', command: 'foo', force: true}])
  t.end()
})

tape('other from', function (t) {
  t.same(parse('FROM ./path'), [{type: 'from', image: null, version: null, path: './path'}])
  t.same(parse('FROM "./path space"'), [{type: 'from', image: null, version: null, path: './path space'}])
  t.end()
})

tape('arg', function (t) {
  t.same(parse('ARG foo=bar\nARG foo'), [{
    type: 'arg',
    key: 'foo',
    value: 'bar'
  }, {
    type: 'arg',
    key: 'foo',
    value: null
  }])
  t.end()
})

tape('env', function (t) {
  t.same(parse('ENV key value'), [{
    type: 'env',
    env: [{
      key: 'key',
      value: 'value'
    }]
  }])

  t.same(parse('ENV key=value'), [{
    type: 'env',
    env: [{
      key: 'key',
      value: 'value'
    }]
  }])

  t.same(parse('ENV key1=value1 key2=value2'), [{
    type: 'env',
    env: [{
      key: 'key1',
      value: 'value1'
    }, {
      key: 'key2',
      value: 'value2'
    }]
  }])

  t.end()
})

tape('stringify', function (t) {
  t.same(stringify([{type: 'from', image: 'arch'}]), 'FROM arch\n')

  var input = [{
    type: 'from',
    path: './foo'
  }, {
    type: 'arg',
    key: 'foo',
    value: 'bar'
  }, {
    type: 'run',
    command: 'echo hello'
  }, {
    type: 'copy',
    from: 'a',
    to: 'b'
  }, {
    type: 'env',
    env: [{
      key: 'hello',
      value: 'world'
    }, {
      key: 'key',
      value: 'bunch of spaces'
    }]
  }]

  t.same(stringify(input), 'FROM "./foo"\nARG foo="bar"\nRUN echo hello\nCOPY "a" "b"\nENV hello="world" key="bunch of spaces"\n')
  t.same(noNull(parse(stringify(input))), input)
  t.end()
})

function noNull (inp) {
  inp.forEach(function (i) {
    Object.keys(i).forEach(function (k) {
      if (i[k] === null) delete i[k]
    })
  })
  return inp
}
