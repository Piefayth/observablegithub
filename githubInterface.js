'use strict'

class Github {
  constructor(){
    this.url = 'https://api.github.com/search/repositories?q=language:javascript stars:>50&sort=updated';
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
    this.waiting = true;
    this.url = this.nexturl;
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
}
