{exec} = require 'child_process'

task 'build', 'Build', ->
  exec 'coffee -c .', ->
    handleExec.apply this, arguments
    exec 'cat shebang getRepos.js > getRepos', ->
      handleExec.apply this, arguments

handleExec = (error, stdout, stderr) ->
  console.info "#{stdout||''}#{stderr||''}#{error||''}"