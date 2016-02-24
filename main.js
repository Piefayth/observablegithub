const ACCESS_TOKEN = '73b3b27673991e5876e70174744a0e4d35b09642';

function handleIncomingRepos(data){

  $.each(data.items, (index, item) => {
    $('#content').append('<div class="repoListItem">' + item.language
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

  var readmeObservable = Rx.Observable.just('https://api.github.com/repos/' + repo.name + '/readme?access_token=' + ACCESS_TOKEN)
  .flatMap(url => $.getJSON(url));

  readmeObservable.subscribe(
    data => {
      $('#readme')
      .empty()
      .append(marked(atob(data.content)));
      console.log('scroll');
      $('.scrollable').animate({ scrollTop: 0 }, 0);
    },
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
    if ($content.scrollTop() + 2000 > $('#content .repoListItem').length * 100){
      search.next(handleIncomingRepos);
    }
  }
}

$(() => init());
