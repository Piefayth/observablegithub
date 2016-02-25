// Github disables this when you push, so, no worries.
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

function handleIncomingRepos(data){

  $.each(data.items, (index, item) => {
    // reactive as fuck
    $('#content').append('<div class="repoListItem"><div class="repoListItemLeft">' + item.language
                    + ' (<a href="' + item.url  + '">Source</a>)</div>'
                    + '<div class="repoListItemRight">' + item.stars + ' Stars | '
                    + item.forks + ' Forks</div></br></br><p>'
                    + '<h3><a href="#">' + item.name + '</a></h3></p><p>'
                    + item.description + '</p></div>');

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
      .append(marked(decodeURIComponent(escape(atob(data.content)))));
      $('.scrollable').animate({ scrollTop: 0 }, 0);
    },
    error => {
      $('#readme')
      .empty()
      .append('<div id="sorry">Couldn\'t seem to find a Readme.</div>');
    }
  )
}

function init(){
  const $content = $('#content');
  var search = new RepoSearch();
  search.next(handleIncomingRepos);

  Rx.Observable.fromEvent($('#searchButton'), 'click')
  .subscribe(searchHandler);

  function searchHandler(){
    var params = {
      search: $('#queryInput').val(),
      sort: $('#sortSelect').val(),
      order: $('#orderSelect').val()
    };

    search.updateParams(params);
    search.next(handleIncomingRepos);
    $content.empty();
  }

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
