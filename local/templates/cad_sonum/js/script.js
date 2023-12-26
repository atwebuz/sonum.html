$(document).on('click', '[data-show-more]', function (e)
{
    e.preventDefault();
    var btn = $(this);
    var page = btn.attr('data-next-page');
    var id = btn.attr('data-show-more');
    var bx_ajax_id = btn.attr('data-ajax-id');
    var block_id = "#comp_" + bx_ajax_id;

    var data = {
        bxajaxid: bx_ajax_id
    };
    data['PAGEN_' + id] = page;
    data['SHOW_MORE'] = 'Y';
    // btn.addClass("loading");

    $.ajax({
        type: "GET",
        url: window.location.href,
        data: data,
        timeout: 3000,
        dataType: 'html',
        beforeSend: function ()
        {

        },
        success: function (data)
        {
            data = '<div>' + data + '</div>';

            const showMoreContainerClass = '.js-show-more-container';
            const paginatoClass = '.js-showmore-paginator';
            const showMoreContainer = $(data).find(showMoreContainerClass);

            if(showMoreContainer.length) {
                const container =  $(block_id);
                const itemsHTML = showMoreContainer.html();
                container.append(itemsHTML);
                const newUrl = showMoreContainer.attr('data-url');
                if(newUrl) {
                    //history.pushState(null, null, newUrl);
                }
            }

            if($(data).find(paginatoClass).length) {
                $(paginatoClass).html($(data).find(paginatoClass).html());
            }
        },
        complete: function ()
        {

        }
    });
});

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function getCookieDomain() {
    var hostParts = location.host.split('.');
    var coutParts = hostParts.length;

    var cookieDomain = '.' + hostParts[coutParts - 2] + '.' + hostParts[coutParts - 1];
    return cookieDomain;
}

$(document).on('click', '.btn-compare', function (e) {
    e.preventDefault();

    if ($(this).hasClass('is-active')) {
        cadCompareRemove($(this), $.cookie('BX_COMPARE_CUSTOM'));
    } else {
        cadCompareAdd($(this), $.cookie('BX_COMPARE_CUSTOM'));
    }
    changeHeaderCompare();
});


$(document).on('click', '.js-btn-remove-compare', function (e) {
    e.preventDefault();
    cadCompareRemove($(this), $.cookie('BX_COMPARE_CUSTOM'));
    changeHeaderCompare();
});

function cadCompareRemove(_this) {
    var cookie = $.cookie('BX_COMPARE_CUSTOM');
    var compareArr = cookie.split(',');
    var productId = _this.attr('data-product-id');
    if (in_array(productId, compareArr)) {
        var index = -1;
        for (var i = 0; i < compareArr.length; i++) {
            if (productId == compareArr[i]) {
                compareArr.splice(i, 1);
            }
        }
        var compareStr = compareArr.join(',');
        $.cookie('BX_COMPARE_CUSTOM', compareStr, {expires: 30, domain: getCookieDomain(), path: '/'});
        _this.removeClass('is-active');
    }
}

function cadCompareAdd(_this) {
    var cookie = $.cookie('BX_COMPARE_CUSTOM');
    var compareStr;
    var productId = _this.attr('data-product-id');

    if (cookie !== undefined && cookie !== '') {
        var compareArr = cookie.split(',');
        if (!in_array(productId, compareArr)) {
            compareArr.push(productId);
        }
        compareStr = compareArr.join(',');
    } else {
        compareStr = productId;
    }
    $.cookie('BX_COMPARE_CUSTOM', compareStr, {expires: 30, domain: getCookieDomain(), path: '/'});
    _this.addClass('is-active');
}

function in_array(what, where) {
    for (var i = 0; i < where.length; i++)
        if (what == where[i])
            return true;
    return false;
}

function changeHeaderCompare() {
    var compareItemsCount = $.cookie('BX_COMPARE_CUSTOM') ? $.cookie('BX_COMPARE_CUSTOM').split(',').length : 0;
    const headerCompare = $('.customer-panel__item--compare');
    const headerCompareCount = $('.customer-panel__item--compare-count');
    const compareLink = '/cabinet/comparison/';

    if (compareItemsCount) {
        headerCompareCount.text(compareItemsCount).show();
        headerCompare.attr('href', compareLink);
    } else {
        headerCompareCount.text('0').hide();
        headerCompare.attr('href', 'javascript:void(0)');
    }
}

function setComparisionActive() {
    var cookie = $.cookie('BX_COMPARE_CUSTOM');
    if (cookie != undefined) {
        var compareArr = cookie.split(',');
        for (key in compareArr) {
            productId = compareArr[key];
            $('.btn-compare[data-product-id="' + productId + '"]').addClass('is-active');
        }
    }
}

window.setComparisionActive = setComparisionActive;

window.loadMapsApi = function (cb) {
    if (!window.isMapsApiLoaded) {
        const script = document.createElement('script');

        //966b94de-4240-42dc-8160-839ee96e6dc5
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=09173dba-3614-43d2-8464-86a720f04121&lang=ru_RU';

        script.addEventListener('load', function () {
            window.isMapsApiLoaded = true;
            cb && cb();
        });

        document.body.appendChild(script);
    } else {
        cb && cb();
    }
};

$(document).on('click', '.js-select-sizes-link input', function (ev) {
    let _this = $(this).parents('.js-select-sizes-link');
    if(_this.attr('data-linked-product-url')) {
        location.href = _this.attr('data-linked-product-url');
        return;
    }
    const price = _this.attr('data-price'),
        oldPrice = _this.attr('data-old-price'),
        priceNoOptions = _this.attr('data-price-no-options'),
        oldPriceNoOptions = _this.attr('data-old-price-no-options'),
        offerId = _this.attr('data-offer-id'),
        productId = _this.attr('data-product-id'),

        jsChangeConfigBtn = $('.js-change-config-btn--' + productId),

        selectBlock = _this.parents('.select-block'),
        input = selectBlock.find('input[type="hidden"]'),
        width = _this.attr('data-offer-width'),
        length = _this.attr('data-offer-length'),
        height = _this.attr('data-offer-height'),
        constructionSize = _this.attr('data-offer-construction-size'),
        materialItems = $('.js-item-config');
    let sizes = width + '-' + length;

    if (window.cad_element_config != undefined) {
        window.cad_element_config.prices.PRICE = price;
        window.cad_element_config.prices.OLD_PRICE = oldPrice;
        window.cad_element_config.prices.OLD_PRICE_NO_OPTIONS = oldPriceNoOptions;
        window.cad_element_config.prices.PRICE_NO_OPTIONS = priceNoOptions;
        window.cad_element_config.offer_id = offerId;
    }

    if(_this.parents('#js-element-config-sizes').length) {
        _this.parents('.config-item').click()
    }

    if ($(document).find('.js-select-type-size').length) {
        $(document).find('.js-select-type-size').find('.if-open-hide').text(sizes);
    }

    changeOffer(productId, offerId);

    if (_this.parents('.js-select-sizes-group').length) {//Если в карточке товара
        setTimeout(function () { //Синхронизация переключения размеров
            $(document).find('.js-select-sizes-group .js-select-sizes-link').removeClass('is-active active');
            if(!_this.hasClass('single-size')) {
                $(document).find('.js-select-sizes-group .js-select-sizes-link[data-offer-id=' + offerId + ']').addClass('active');
            }
            if (width) {
                $(document).find('.js-select-sizes-group .select-size__params--width').text(width);
            }
            if (length) {
                $(document).find('.js-select-sizes-group .select-size__params--length').text(length);
            }
            if (height || constructionSize) {
                $(document).find('.js-select-sizes-group .select-size__params--height').text(constructionSize || height);
            }

            let sizes = width + '-' + length;
            if(height) {
                sizes += '-' + height;
            } else {
                sizes += ' см';
            }
        }, 100);

        loadOptions(offerId, _this);

    } else {
        $('.js-price-current--' + productId).text(number_format(price, 0, '.', ' '));
        $('.js-old-price-current--' + productId).text(number_format(oldPrice, 0, '.', ' '));
        loadCardPicture(_this)
    }

    materialItems.attr('data-selected-offer-id', offerId).data('selected-offer-id', offerId);
    materialItems.attr('data-selected-offer-width', width).data('selected-offer-width', width);
    materialItems.attr('data-selected-offer-length', length).data('selected-offer-length', length);

    if (input.length) {
        input.val(offerId);
    }

    jsChangeConfigBtn.attr('data-offer-id', offerId).data('offer-id', offerId);
    jsChangeConfigBtn.attr('data-offer-length', length).data('offer-length', length);
    jsChangeConfigBtn.attr('data-offer-width', width).data('offer-width', width);


    if ($('[data-selected-offer-length]').length) {
        $('[data-selected-offer-length]').attr('data-selected-offer-length', length).data('selected-offer-length', length);
    }

    if ($('[data-selected-offer-width]').length) {
        $('[data-selected-offer-width]').attr('data-selected-offer-width', width).data('selected-offer-width', width);
    }

    if ($('.offer-url-' + productId).length) {
        var href = $('.offer-url-' + productId).attr('href');
        href = addParams(href, 'offerId', offerId);
        $('.offer-url-' + productId).attr('href', href);
    }

    if (offerId) {
        let newUrl = addParams(location.href, 'offerId', offerId);
        history.replaceState(null, null, newUrl);
    }

});

function delParams(url, paramName) {
    var res = '';
    var d = url.split("#")[0].split("?");

    var base = d[0];
    var query = d[1];
    var newUrl;
    if (query) {
        var params = query.split("&");
        for (var i = 0; i < params.length; i++) {
            var keyval = params[i].split("=");
            if (keyval[0] != paramName) {
                res += params[i] + '&';
            }
        }
        if (res) {
            res = res.substring(0, res.length - 1);
            newUrl = base + '?' + res;
        } else newUrl = base;
    } else newUrl = base;

    return newUrl;
}

function addParams(url, paramName, paramVal) {
    var newUrl;
    url = delParams(url, paramName);
    if (url.indexOf('?') > 0) newUrl = url + '&';
    else newUrl = url + '?';
    newUrl = newUrl + paramName + '=' + paramVal;
    return newUrl;
}

function getParams(url = location.search) {
    var regex = /[?&]([^=#]+)=([^&#]*)/g, params = {}, match;
    while (match = regex.exec(url)) {
        params[match[1]] = match[2];
    }
    return params;
}


$(document).on('change', '.js-sort-item', function () {
    var url = $(this).parents('.sort-list__item').attr('data-url');
    if (url) {
        location.href = url;
    }
});

function numWord(value, words) {
    let result = value + ' ';
    value = Math.abs(value) % 100;
    let num = value % 10;
    if (value > 10 && value < 20) result += words[2];
    else if (num > 1 && num < 5) result += words[1];
    else if (num == 1) result += words[0];
    else result += words[2]
    return result;
}

$(document).on('change', '.js-filter-material', function () {
    console.log('change');
    let checkedInput = $('.js-filter-material:checked');
    let checked = {color: [], material: []};
    var itemColor;
    var itemMaterial;
    var selectedColor = [];
    var selectedMaterial = [];
    var currentCheck;
    const countColor = $('.js-count-item-color');
    const countMaterial = $('.js-count-item-material');

    if (checkedInput.length) {
        checkedInput.each(function () {
            if ($(this).attr('data-input-material-group')) {
                checked.material.push($(this).attr('data-input-material-group'));
            }
            if ($(this).attr('data-input-color')) {
                checked.color.push($(this).attr('data-input-color'));
            }
        });

        $('.js-item-config').each((index, el) => {

            itemColor = $(el).attr('data-color-id');
            itemColor = itemColor.split(',');
            itemMaterial = $(el).attr('data-material-group-id');
            itemMaterial = itemMaterial.split(',');

            if ((checked.color.length && !checked.color.filter(x => itemColor.includes(x)).length) || (checked.material.length && !checked.material.filter(x => itemMaterial.includes(x)).length)) {
                $(el).addClass('none');
            } else {
                $(el).removeClass('none');

                itemColor.forEach(function(item) {
                    if(!selectedColor.includes(item)) {
                        selectedColor.push(item);
                    }
                });

                itemMaterial.forEach(function(item) {
                    if(!selectedMaterial.includes(item)) {
                        selectedMaterial.push(item);
                    }
                });
            }
        });
        let selected = {'material' : selectedMaterial, 'color' : selectedColor}

        if($(this).attr('data-input-color') != undefined) {
            currentCheck = 'color';
        } else if($(this).attr('data-input-material-group') != undefined) {
            currentCheck = 'material';
        }

        //toggleInputFilter(currentCheck, checked, selected);
        toggleInputFilter2();

    } else {
        $('.js-item-config').each(function () {
            $(this).removeClass('none');
        })

        $('.js-item-input-config').each(function () {
            //$(this).removeClass('none');
            $(this).slideDown();
        })
    }

    let totalCountAppliedFilter = Number(checked.color.length) + Number(checked.material.length);
    countMaterial.text(checked.material.length);
    countColor.text(totalCountAppliedFilter);

    if (totalCountAppliedFilter) {
        countColor.removeClass('none');
    } else {
        countColor.addClass('none');
    }

    toggleActiveFilterItems();
    toggleMaterialGroups();
});

function toggleInputFilter2() {
    let selected = {'color' : [], 'material' : []}
}

function toggleInputFilter(currentCheck, checked, selected) {
    if(!currentCheck) {
        return;
    }

    var itemColor;
    var itemMaterial;
    $('.js-item-input-config').each((index, el) => {

        if(currentCheck == 'material') {
            if($(el).attr('data-color-id') != undefined) {
                if(checked.material.length) {
                    itemColor = $(el).attr('data-color-id');
                    if(selected.color.includes(itemColor)) {
                        //$(el).removeClass('none');
                        $(el).slideDown();
                    } else {
                        //$(el).addClass('none');
                        if(!$(el).find('input').prop('checked')) {
                            $(el).slideUp();
                        }
                    }
                } else {
                    //$(el).removeClass('none');
                    $(el).slideDown();
                }
            }
        }

        if(currentCheck == 'color') {

            if($(el).attr('data-material-group-id') != undefined) {
                if(checked.color.length) {
                    itemMaterial = $(el).attr('data-material-group-id');
                    if(selected.material.includes(itemMaterial)) {
                        //$(el).removeClass('none');
                        $(el).slideDown();
                    } else {
                        //$(el).addClass('none');
                        console.log($(el));
                        if(!$(el).find('input').prop('checked')) {
                            $(el).slideUp();
                        }

                    }
                } else {
                    //$(el).removeClass('none');
                    $(el).slideDown();
                }
            }
        }
    })
}

$(document).on('click', '.js-clear-filters', function () {
    $('.js-item-config').removeClass('none');
    $('.js-material-filter-groups').removeClass('none');
    $('.js-filter-material').prop('checked', false);
    $('.js-count-item-color').text('0').hide();
    $('.js-count-item-material').text('0').hide();
    $('.filter-active__item').remove();
    $('.filter-active').hide();
    window.modal.close('filters');
})

function toggleActiveFilterItems() {
    var filterItems = '';
    var dataType;
    $('.js-filter-material:checked').each(function () {
        let parent = $(this).parents('.filter-block__checkbox');
        let text = parent.find('.checkbox__text').text();

        if ($(this).attr('data-input-color')) {
            dataType = 'data-active-item-filter-color="' + $(this).attr('data-input-color') + '"';
        }

        if ($(this).attr('data-input-material-group')) {
            dataType = 'data-active-item-filter-material="' + $(this).attr('data-input-material-group') + '"';
        }
        filterItems += '<div class="filter-active__item" ' + dataType + '>';
        filterItems += text;
        filterItems += '<svg class="icon icon-close js-remove-active-filter-item">\n' +
            '<use xlink:href="/local/templates/cad_sonum/img/sprite.svg#icon-close"></use>\n' +
            '</svg>';

        filterItems += '</div>';
    })

    $('.filter-active').html(filterItems);
    if (filterItems) {
        $('.filter-active').show();
    } else {
        $('.filter-active').hide();
    }
}

function toggleMaterialGroups() {
    $('.js-material-filter-groups').each(function () {
        let visibleItems = $(this).find('.js-item-config:not(.none)');
        if (visibleItems.length) {
            $(this).removeClass('none');
        } else {
            $(this).addClass('none');
        }
    })
}

$(document).on('click', '.js-remove-active-filter-item', function (e) {
    e.preventDefault();

    let activeFilterItem = $(this).parents('.filter-active__item');

    if (activeFilterItem.attr('data-active-item-filter-color')) {
        setTimeout(function () {
            let colorId = activeFilterItem.attr('data-active-item-filter-color');
            $('.js-filter-material[data-input-color=' + colorId + ']').click();
        })


    } else if (activeFilterItem.attr('data-active-item-filter-material')) {
        setTimeout(function () {
            let materialId = activeFilterItem.attr('data-active-item-filter-material');
            $('.js-filter-material[data-input-material-group="' + materialId + '"]').click();
        });
    }
})

$(document).on('change', '.js-group-material', function () {
    let groupName = $(this).attr('data-group');
    $('[data-tab-block=group]').hide();
    $('[data-tab-block=group][data-tab-block-id=' + groupName + ']').show();
});

function changeOffer(productId, offerId) {
    const addToCartBtn = $('.js-add-to-cart-btn--' + productId),
        oneClickBtn = $('.js-buy-one-click-btn--' + productId);

    oneClickBtn.attr('data-offer-id', offerId).data('offer-id', offerId);
    addToCartBtn.attr('data-offer-id', offerId).data('offer-id', offerId);
}

function changeProductDetailUrl() {
    if ($('.js-element-bases-input:checked').length) {
        let bases = $('.js-element-bases-input:checked').val();
        let newUrl = addParams(location.href, 'bases', bases);
        history.replaceState(null, null, newUrl);
    } else {
        let newUrl = delParams(location.href, 'bases');
        history.replaceState(null, null, newUrl);
    }

    if ($('.js-element-option-input:checked').length) {
        let options = [];
        $('.js-element-option-input:checked').each(function () {
            options.push($(this).val());
        });
        let newUrl = addParams(location.href, 'options', options.join('-'));
        history.replaceState(null, null, newUrl);
    } else {
        let newUrl = delParams(location.href, 'options');
        history.replaceState(null, null, newUrl);
    }
}

$(document).on('click', '.js-element-option-input', function (e) {
    const optionEl = $('.js-element-option-input:checked');
    window.cad_element_config.options = [];
    optionEl.each(function() {
        window.cad_element_config.options.push({
            'id': $(this).val(),
            'price': $(this).attr('data-price'),
            'name': $(this).attr('data-name')
        });
    });
        if(optionEl.length) {
        $('.js-config-options-text').text('Выбрано: (' + optionEl.length + ')');
    } else {
        $('.js-config-options-text').text('Не выбрано');
    }

    changePrices();
    changeProductDetailUrl();
});

$(document).on('change', '.js-element-bases-input', function (e) {
   const basesEl = $('.js-element-bases-input:checked');
    window.cad_element_config.bases = {
        'id': basesEl.val(),
        'price': basesEl.attr('data-price'),
        'name': basesEl.attr('data-name')
    }
    let basesName = basesEl.attr('data-name');
    $('.js-config-bases-text').text(basesName);
    $('.config-item__select-text--bases .if-open-hide').text(basesName);

    changePrices();
    changeProductDetailUrl();
    toggleLiftingDeviceOption();
    window.configChangeHeight();
});

function toggleLiftingDeviceOption() {
    const basesEl = $('.js-element-bases-input:checked');
    const liftingDeviceInputEl = $('[data-lifting-device]');

    if(liftingDeviceInputEl == undefined) {
        return;
    }

    const liftingDeviceItemEl = liftingDeviceInputEl.parents('.checkbox');

    if(basesEl.attr('data-transform-bases') == undefined) {
        liftingDeviceItemEl.removeClass('d-none');
    } else {
        if(liftingDeviceInputEl.prop('checked')) {
            liftingDeviceInputEl.click();
        }
        liftingDeviceItemEl.addClass('d-none');
    }

    const optionsConfigBlock = $(document).find('[data-config][data-type=options]');
    const optionsBlock = $(document).find('.product-detail-card__flex--options');
    let countAvailableOptions = optionsConfigBlock.find('.checkbox--image:not(.d-none)').length;
    if(countAvailableOptions) {
        optionsConfigBlock.removeClass('d-none');
        optionsBlock.removeClass('d-none');
    } else {
        optionsConfigBlock.addClass('d-none');
        optionsBlock.addClass('d-none');
    }
    changeCountOptions();
}

function changeCountOptions() {
    const optionsEl = $('#config-type--options');
    const availableOptions = optionsEl.find('[data-config-item]:not(.d-none)')
    var countAvailableOptions = availableOptions.length;
    countAvailableOptions = countAvailableOptions + getDeclension(countAvailableOptions, [' вариант', ' варианта', ' вариантов']);
    var countCheckedOptions = optionsEl.find('input[type="checkbox"]:checked').length;
    if(countCheckedOptions) {

    }
    const textEl = optionsEl.find('.config-item__select-text').find('.if-open-hide');
    if(countCheckedOptions) {
        textEl.text('Выбрано:(' + countCheckedOptions + ')');
    } else {
        textEl.text(countAvailableOptions);
    }
    textEl.attr('data-config-selected', countAvailableOptions);
}

function getDeclension(number, txt) {
    var cases = [2, 0, 1, 1, 1, 2];
    return txt[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function getTotalProductPrices() {
    let totalPrice;
    let totalOldPrice;
    let installmentPrice;

    if (window.cad_element_config.bases.price != undefined) {
        totalPrice = Number(window.cad_element_config.prices.PRICE_NO_OPTIONS) + Number(window.cad_element_config.bases.price);
        totalOldPrice = Number(window.cad_element_config.prices.OLD_PRICE_NO_OPTIONS) + Number(window.cad_element_config.bases.price);
    } else {
        totalPrice = Number(window.cad_element_config.prices.PRICE);
        totalOldPrice = Number(window.cad_element_config.prices.OLD_PRICE);
    }

    if (window.cad_element_config.options != undefined) {
        window.cad_element_config.options.forEach(item => {
            totalPrice += Number(item.price);
            totalOldPrice += Number(item.price);
        })
    }
    window.cad_element_config.prices.TOTAL_PRICE = totalPrice;
    window.cad_element_config.prices.TOTAL_OLD_PRICE = totalOldPrice;
    if(window.cad_element_config.prices.INSTALLMENT_MONTH) {
        window.cad_element_config.prices.TOTAL_INSTALLMENT_PRICE = totalPrice / Number(window.cad_element_config.prices.INSTALLMENT_MONTH);
    }

}

function number_format(number, decimals, dec_point, thousands_sep) {	// Format a number with grouped thousands
    var i, j, kw, kd, km;

    // input sanitation & defaults
    if (isNaN(decimals = Math.abs(decimals))) {
        decimals = 2;
    }
    if (dec_point == undefined) {
        dec_point = ",";
    }
    if (thousands_sep == undefined) {
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if ((j = i.length) > 3) {
        j = j % 3;
    } else {
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    //kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


    return km + kw + kd;
}

function changePrices() {
    getTotalProductPrices();
    $('.js-price-current--' + window.cad_element_config.product_id).text(number_format(window.cad_element_config.prices.TOTAL_PRICE, 0, '.', ' '));
    $('.js-old-price-current--' + window.cad_element_config.product_id).text(number_format(window.cad_element_config.prices.TOTAL_OLD_PRICE, 0, '.', ' '));
    $('.js-installment-price--' + window.cad_element_config.product_id).text(number_format(window.cad_element_config.prices.TOTAL_INSTALLMENT_PRICE, 0, '.', ' '));
}

$(document).on('click', '.js-open-jivo-api', function (e) {
    e.preventDefault();
    if (typeof (jivo_api) == 'undefined') {
        if (typeof (requireJivo) == 'function') {
            requireJivo(true);
        }
    } else {
        jivo_api.open();
    }
    $('.jivo-pseudo-btn__color-socials').removeClass('active');
})

function setArticleMark() {
    if ($('.js-rating-form-container').length && window.articleRatings != undefined) {
        var elementId;
        var ratingContainer;
        var stars;
        $('.js-rating-form-container').each(function () {
            ratingContainer = $(this);
            elementId = $(this).attr('data-element-id');
            if (window.articleRatings[elementId]) {
                stars = $(this).find('.rating__item');
                stars.each(function (index, star) {
                    if (index < window.articleRatings[elementId]) {
                        $(star).addClass('is-active');
                    }
                });
                ratingContainer.find('.js-rating').removeClass('js-rating');
                if (ratingContainer.find('.js-rating-form-title').length) {
                    ratingContainer.find('.js-rating-form-title').text('Ваша оценка')
                }
            }
        })
    }
}

function setArticleMediaLikes() {
    if ($('.like-btn').length && window.articleMediaLikes != undefined) {
        if (typeof (window.articleMediaLikes) == 'object') {
            var likeContainer;
            for (elementId in window.articleMediaLikes) {
                likeContainer = $('.like-btn[data-element-id="' + elementId + '"]');
                if (likeContainer.length) {
                    likeContainer.addClass('like-btn--is-active').removeClass('ajax-link2');
                    likeContainer.find('.like__counter').text(window.articleMediaLikes[elementId]);
                }

            }
        }
    }
}

const copyCurrentUrl = function ($el) {
    const input = document.createElement("input"),
        url = window.location.href;

    document.body.appendChild(input);
    input.value = url;
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    console.log('copied', url);

    const $tooltip = $el.closest('.tooltip');

    $tooltip.addClass('is-active');

    setTimeout(() => {
        $tooltip.removeClass('is-active');
    }, 5000);
}

$(document).on('click', '[data-share]', function (e) {
    e.preventDefault();

    const $this = $(this);

    let service = $this.data('share'), curPage = location.href, encoded = encodeURI(curPage);

    switch (service) {
        case 'copy':
            copyCurrentUrl($this);
            break;
        case 'vk':
            window.repost('//vk.com/share.php?url=' + encoded)
            break;
        case 'fb':
            window.repost('//www.facebook.com/sharer/sharer.php?u=' + encoded)
            break;
        case 'tw':
            window.repost('//twitter.com/intent/tweet?url=' + encoded)
            break;
        case 'tg':
            window.repost('https://telegram.me/share/url?url=' + encoded)
            break;
        case 'wup':
            window.repost('https://api.whatsapp.com/send?text=' + encoded)
            break;
        case 'viber':
            window.repost('viber://forward?text=' + encoded)
            break;
    }
    return false;
});

window.repost = function (link) {
    window.open(
        link,
        '_blank',
        'scrollbars=0, resizable=1, menubar=0, left=100, top=100, width=550, height=440, toolbar=0, status=0'
    );
}
$(document).on('click', '.icon-star', function () {
    const ratingInput = $(this).parents().eq(1).siblings('.js-rating-hidden-field');
    const elementId = $(ratingInput).attr('data-element-id');
    const rating = $(ratingInput).val();
    if (rating > 0 && elementId) {
        var formData = new FormData();
        formData.append('action', 'Rating/addArticleMark');
        formData.append('mark', rating);
        formData.append('elementId', elementId);
        window.sendAjax(formData, $(this), window.ajaxCallback['afterAddArticleMark']);
    }
});

$(document).on('click', '.js-location-item', function() {
    let locationCode = $(this).attr('data-code');
    let text = $(this).text();
    const container = $(this).parents('.location');
    const searchList = $(this).closest('.search-list');
    const input = container.find('[data-location-input]');
    const inputHidden = container.find('input[type=hidden]');
    input.val(text).trigger('change');
    inputHidden.val(locationCode).trigger('change');
    searchList.removeClass('is-active');

    initSuggestion(text.split(',')[0]);
})


if($('.section-best-price__products').length) {
    var bestProductsTabs = $('.section-best-price__products');
    var firstTabBestProducts = $(bestProductsTabs[0]);
    var initHeight = firstTabBestProducts.height();
    bestProductsTabs.attr('style', 'height:' + initHeight+'px');
}
