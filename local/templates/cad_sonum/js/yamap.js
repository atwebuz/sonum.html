$(document).ready(function () {
    const $html = $('html');
    const $body = $('body');
    var CITY = '';
    var SHOPS_CITY = false;

    /* Определение местоположения */
    var userCity = getCookie('USER_CITY');
    var userCityId = getCookie('USER_CITY_ID');
    console.log(userCity, userCityId);
    var getStore = $('div').is('.js-store-available');
    if (userCity && userCityId) {

        $('.choice-city__name').text(userCity);
        loadShops(userCity);
        if (getStore) {
            getStoreAvailable($('.js-store-available').data('product-id'), userCityId);
        }
    } else {
        setTimeout(function () {
            window.loadMapsApi(function () {
                ymaps.ready(function () {
                    var location = ymaps.geolocation;

                    // Получение местоположения
                    location.get({
                        provider: 'yandex',
                        mapStateAutoApply: true,
                        kind: 'locality'
                        //mapStateAutoApply: true
                    })
                        .then(
                            function (result) {
                                // Получение местоположения пользователя.
                                var userAddress = result.geoObjects.get(0).properties.get('name');
                                $('.choice-city__name').text(userAddress);
                                window.CITY = userAddress;
                                loadShops(window.CITY);
                                try {
                                    $.post("/local/ajax/hnsGetCityDataByName.php?city=" + userAddress).done(function (qq) {
                                        var jsonqq = qq;
                                        qq = JSON.parse(qq);
                                        if (qq.hasOwnProperty('ID')) {
                                            window.CITY_ID = +qq.ID;
                                            if (getStore) {
                                                getStoreAvailable($('.js-store-available').data('product-id'), window.CITY_ID);
                                            }
                                            setUserCityId(+qq.ID)
                                        }

                                        if (qq.hasOwnProperty('NAME')) {
                                            setUserCity(qq.NAME)
                                        }

                                        if (qq.hasOwnProperty('NAME') && qq.hasOwnProperty('ID')) {
                                            window.modal.openWithAjax('check-city');
                                        } else {
                                            saveDefineCityError(userAddress, jsonqq);
                                        }
                                    });
                                } catch (e) {
                                    console.log(e);
                                }

                                if(!getCookie('USER_CITY')) {
                                    setUserCity('Иваново')
                                }
                                if(!getCookie('USER_CITY_ID')) {
                                    setUserCityId('675')
                                }
                            },
                            function (err) {
                                console.log(err);
                            },

                        );
                });
            });
        }, 500);
    }

    function setUserCity(city) {
        console.log(city)
        $.cookie('USER_CITY', city, {expires: 30, domain: getCookieDomain(), path: '/'});
    }

    function setUserCityId(cityId) {
        console.log(cityId)
        $.cookie('USER_CITY_ID', cityId, {expires: 30, domain: getCookieDomain(), path: '/'});
    }

    function saveDefineCityError(userAddress, json) {
        $.ajax({
            url: '/local/ajax/save_define_city_error.php',
            type: 'POST',
            data: {address: userAddress, json: json},
            crossDomain: true,
            dataType: 'json',
            success: function (data) {
                console.log(data);
            }
        });
    }

    $(document).on('click', '.city-modal__list a', function (e) {
        e.preventDefault();
        window.CITY = $(this).data('city');
        window.CITY_ID = +($(this).data('id'));
        $('.choice-city__name').text(window.CITY);

        $.ajax({
            url: '/local/ajax/city_redirect.php',
            type: 'POST',
            data: {userCity: window.CITY},
            crossDomain: true,
            dataType: 'json',
            success: function (data) {
                setUserCity(window.CITY);
                setUserCityId(window.CITY_ID)
                var siteUrl = window.location.hostname;
                var regex = /^([a-z0-9]{1,})./gi;
                var res = regex.exec(siteUrl);
                if (data.STATUS == 'error') {

                    // Если поддомена для такого сайта нет - проверяем, не находимся ли мы сейчас на поддомене и переадресовываем
                    if (res[1] != 'sonum') {
                        document.location.href = window.location.href.replace(res[0], '');
                    } else {
                        document.location.reload();
                    }
                }
                if (data.STATUS == 'success') {
                    // Если поддомен для такого сайта есть - переадресовываем
                    if (data.DATA.UF_SUBDOMAIN != undefined) {
                        var url = window.location.protocol + "//" + data.DATA.UF_SUBDOMAIN + '.sonum.ru' + window.location.pathname;
                        document.location.href = url;
                    }
                }
            }
        });

    });

    changeHeaderCompare();
    setComparisionActive();
    setArticleMark();
    setArticleMediaLikes();

});