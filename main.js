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

  var readmeObservable = Rx.Observable.just('https://api.github.com/repos/' + repo.name + '/readme')
  .flatMap(url => $.getJSON(url));

  readmeObservable.subscribe(
    data => $readme
            .empty()
            .append(marked(atob(data.content))),
    error => console.log(error)
  )

}

function init(){
  const $content = $('#content');
  var search = new RepoSearch();
  search.next(handleIncomingRepos);

  Rx.Observable.fromEvent($content, 'scroll')
  .throttle(1000)
  .takeWhile(search.isNotWaiting)
  .subscribe(scrollHandler);

  function scrollHandler(){
    if ($content.scrollTop() + 2500 > $('#content .repoListItem').length * 100){
      search.next(handleIncomingRepos);
    }
  }
}

$(() => init());
