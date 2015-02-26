// Generated by CoffeeScript 1.9.1
(function() {
  var bar, exec, fs, program, progress, ref, request;

  ref = [require('fs'), require('request'), require('child_process').exec, require('node-status'), null, require('commander')], fs = ref[0], request = ref[1], exec = ref[2], progress = ref[3], bar = ref[4], program = ref[5];

  program.version('1.1.0').usage('[user/org] [options]').option('--no-progress', 'disable the progress bar').option('--ssh', 'use ssh support instead of http');

  program.command('*').action(function(user) {
    var allRepos, clone, getRepos, options, pageNum, prog;
    allRepos = [];
    pageNum = 2;
    options = {
      timeout: 5000,
      method: "GET",
      url: "https://api.github.com/users/" + user + "/repos",
      headers: {
        'User-Agent': 'node-request'
      },
      json: true
    };
    getRepos = function(cb) {
      return request(options, function(error, response, repos) {
        var result, rexurl;
        rexurl = new RegExp('<(.+)>; rel="next",', ['i']);
        result = rexurl.exec(response.headers.link);
        if ((error == null) && response.statusCode === 200) {
          Array.prototype.push.apply(allRepos, repos);
          if (result) {
            options.url = result[1];
            return getRepos(cb);
          } else {
            return cb();
          }
        } else {
          return console.error("Status: " + response.statusCode + ", Error: " + error + "||" + repos + " (404 means github user does not exist)");
        }
      });
    };
    prog = null;
    getRepos(function() {
      if (allRepos.length > 0) {
        prog = progress.addItem("hardcore cloning", {
          type: ['bar', 'percentage', 'count'],
          max: allRepos.length
        });
        progress.start();
        return clone(allRepos);
      } else {
        return console.info("No public repos to clone");
      }
    });
    return clone = function(repos) {
      var repo, url;
      repo = repos.pop();
      url = program.ssh ? repo.ssh_url : repo.clone_url;
      return exec("git clone " + url, function(err, stdout, stderr) {
        if (err && err.message.indexOf('not an empty directory') < 0) {
          console.error(err.message);
        }
        prog.inc();
        if (allRepos.length > 0) {
          return process.nextTick(function() {
            return clone(repos);
          });
        } else {
          return progress.stop();
        }
      });
    };
  });

  program.parse(process.argv);

  if (!program.args.length) {
    program.help();
  }

}).call(this);
