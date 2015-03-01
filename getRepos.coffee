[fs, request, exec, progress, bar, program] = [(require 'fs'), (require 'request'), require('child_process').exec, (require 'node-status'), null, (require 'commander')]

program
  .version('1.1.0')
  .usage('[user/org] [options]')
  #.option('--no-progress', 'disable the progress bar')
  .option('--ssh', 'use ssh support instead of http')

program
  .command('*')
  .action((user) ->

    allRepos = []

    options =
      timeout: 5000
      method: "GET"
      url: "https://api.github.com/users/#{user}/repos"
      headers:
        'User-Agent': 'node-request'
      json: true

    getRepos = (cb) ->
      request options, (error, response, repos) ->
        rexurl = new RegExp '<(.+)>; rel="next",',['i']
        result = rexurl.exec response.headers.link
        if not error? and response.statusCode is 200
          Array::push.apply allRepos, repos
          if result
            options.url = result[1]
            getRepos(cb)
           else
            cb()
        else
          console.error "Status: #{response.statusCode}, Error: #{error}||#{repos} (404 means github user does not exist)"

    prog = null

    getRepos ->
      if allRepos.length > 0
        prog = progress.addItem "hardcore cloning", {type: ['bar', 'percentage', 'count'], max: allRepos.length}
        progress.start()
        clone allRepos
      else
        console.info "No public repos to clone"

    clone = (repos) ->
      repo = repos.pop()
      url = if program.ssh then repo.ssh_url else repo.clone_url
      exec "git clone #{url}", (err, stdout, stderr) ->
        if err and err.message.indexOf('not an empty directory') < 0 then console.error err.message
        prog.inc()
        if allRepos.length > 0 then process.nextTick () -> clone repos else progress.stop())

program.parse process.argv

program.help() if !program.args.length
