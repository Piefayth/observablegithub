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

function init(){
  const $content = $('#content');
  var gh = new Github();
  gh.next(handleIncomingRepos);

  Rx.Observable.fromEvent($content, 'scroll')
  .throttle(1000)
  .takeWhile(gh.isNotWaiting)
  .subscribe(scrollHandler);

  function scrollHandler(){
    //$content.scrollTop();
    if ($content.scrollTop() + 2500 > $('#content .repoListItem').length * 100){
      gh.next(handleIncomingRepos);
    }
  }
}



$(() => init());
//$( does => queryGithub('language:javascript stars:>50'));
