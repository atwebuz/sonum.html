$(document).on('click', '.js-change-url', function() {
    if(!$(this).hasClass('is-active')) {
        let url = $(this).attr('data-url');
        if(url) {
            history.pushState(null, null, url);
        }
        let name = $(this).text();
        if(name) {
            $('.breadcrumb__list .breadcrumb__item:last-child .breadcrumb__link').text(name);
        }
    }
})