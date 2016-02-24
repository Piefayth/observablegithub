function queryGithub(query){

  var urlStream = Rx.Observable.just('https://api.github.com/search/repositories?q=' + query + '&sort=updated');

  var responseStream = urlStream.flatMap(url => {
    var request = $.getJSON(url, data => {
      data.headers = request.getAllResponseHeaders().split('\n');
      data.items = data.items.map(repo => {
        return {
          forks: repo.forks_count,
          stars: repo.stargazers_count,
          url: repo.url,
          name: repo.full_name,
          description: repo.description || "No description found.",
          language: repo.language
        }
      });
    });
    return request;
  });

  responseStream.subscribe(
    handleIncomingRepos,
    error => console.log(error)
  );

}

function handleIncomingRepos(data){
  const $content = $('#content');

  $.each(data.items, (index, item) => {
    $content.append('<div class="repoListItem">' + item.language
                    + ' | <a href="#">' + item.name + '</a><p>'
                    + item.description + '</p><div>');

    var $link = $('.repolistItem:last-child a');
    Rx.Observable.fromEvent($link, 'click')
    .subscribe(event => {
      loadAndDisplayReadme(item);
    })
  })
}

function loadAndDisplayReadme(repo){
  const $readme = $('#readme');

  var readmeStream = Rx.Observable.just('https://api.github.com/repos/' + repo.name + '/readme')
  .flatMap(url => $.getJSON(url));

  readmeStream.subscribe(
    data => $readme
            .empty()
            .append(marked(atob(data.content))),
    error => console.log(error)
  )

}

$( does => queryGithub('language:javascript stars:>50'));
