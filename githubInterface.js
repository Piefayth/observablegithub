'use strict'

class RepoSearch {
  constructor(){
    this.urls = [this._buildQuery({
      sort: 'updated',
      language: 'javascript',
      stars: '>50',
      search: 'cool'
    })];
    this.waiting = false;
    this.endOfCurrentSearch = false;
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
    if(this.endOfCurrentSearch) return Rx.Observable.empty();
    this.waiting = true;
    return Rx.Observable.from(this.urls)
      .last()
      .flatMap(url => {
        var request = $.getJSON(url, data => {
        data.headers = this._parseHeaders(request.getAllResponseHeaders());
        data.items = this._pickContent(data.items);
        this.waiting = false;
      });
      return request;
    })
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
    var headers = rawHeaders.split('\n')
    .map(h => {
      var match = h.match(/([\w-]+)\:\s(.*)/);
      var oneHeader = {};
      if(match) {
        if(match[1] === 'Link'){
          var nextLink = match[2].split(',')
            .map(item => item.split('; '))
            .filter(item => /next/.test(item[1]));
          if(nextLink.length > 0){
            nextLink = nextLink.pop()[0]
            .replace(/[<>]/g, '');
            this.urls.push(nextLink);
          } else {
            this.endOfCurrentSearch = true;
          }
        }
        oneHeader[match[1]] = match[2];
      }
      return oneHeader;
    });

    return headers;
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
