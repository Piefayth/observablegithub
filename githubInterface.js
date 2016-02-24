'use strict'

class RepoSearch {
  constructor(){
    this.url = this._buildQuery({
      sort: 'updated',
      language: 'javascript',
      stars: '>50',
      search: 'tetris'
    })
    this.nexturl = this.url;
    this.waiting = false;
  }

  isNotWaiting(){
    return !this.waiting;
  }

  next(handler){
    this._next().subscribe(
      handler,
      error => console.log(error)
    );
  }

  _next(){
    if(!this.nexturl) return Rx.Observable.empty();
    this.waiting = true;
    this.url = this.nexturl;
    this.nexturl = null;

    var observableUrl = Rx.Observable.just(this.url);

    return observableUrl.flatMap(url => {
      var request = $.getJSON(url, data => {
        data.headers = this._parseHeaders(request.getAllResponseHeaders());
        data.items = this._pickContent(data.items);
      });
      this.waiting = false;
      return request;
    });

  }

  _pickContent(items){
    return items.map(repo => {
      return {
        forks: repo.forks_count,
        stars: repo.stargazers_count,
        url: repo.url,
        name: repo.full_name,
        description: repo.description || "No description found.",
        language: repo.language
      }
    });
  }

  _parseHeaders(rawHeaders){
    return rawHeaders.split('\n')
    .map(h => {
      var match = h.match(/([\w-]+)\:\s(.*)/);
      var result = {};
      if(match) {
        if(match[1] === 'Link'){
          this.nexturl = match[2].split(',')
            .map(item => item.split('; '))
            .filter(item => /next/.test(item[1]))
            .pop()[0]
            .replace(/[<>]/g, '');
        }
        result[match[1]] = match[2];
      }
      return result;
    });
  }

  _buildQuery(params){
    var query = '?q=',
        end = '',
        search;

    for(var key in params){
      if(key === 'sort'){
        end += '&sort=' + params[key];
      } else if(key === 'order'){
        end += '&order=' + params[key];
      } else if(key === 'search'){
        search = params[key];
      } else {
        query += key + ':' + params[key] + ' ';
      }
    }
    return 'https://api.github.com/search/repositories' + query + ' ' + search + end;
  }
}
