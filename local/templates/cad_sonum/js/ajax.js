/**
 * Created by Cadesign.
 * User: Vladimir
 * Date: 09.10.2019
 * Time: 10:27
 */

$(document).on('click', "[data-jsAction]", function (e) {
    e.preventDefault();
    let $this = $(this);

    if (typeof $this.data("jsaction") !== 'undefined' && typeof window.jsAction[$this.data("jsaction")] === 'function')
        window.jsAction[$this.data("jsaction")]($this);
});

window.jsAction = [];
$(document).on("click", '.ajax-link', function (e) {
    e.preventDefault();
    var data = $(this).data();

    var formData = new FormData();
    $.each(data, function (index, value) {
        formData.append(index, value);
    });

    if(formData.get('action') == 'Element/ChangeMaterial') {
        formData.append("config", JSON.stringify(window.cad_element_config));
    }

    var cb;
    if (typeof data["ajaxCallback"] !== "undefined") {
        cb = window.ajaxCallback[data["ajaxCallback"]];
    } else
        cb = function (container) {
        };
    window.sendAjax(formData, $(data.container), cb);
});

$(document).on('click', '.ajax-link2', function (e) {
    e.preventDefault();
    var data = $(this).data();

    var formData = new FormData();
    $.each(data, function (index, value) {
        formData.append(index, value);
    });

    var cb;
    if (typeof data['ajaxCallback'] !== 'undefined') {
        cb = window.ajaxCallback[data['ajaxCallback']];
    } else {
        cb = function (container) {};
    }
    window.sendAjax(formData, $(this), cb);
});


window.ajaxCallback = [];

$(document).on("submit", ".ajax-form", function (e) {
    e.preventDefault();

    if (0 === validateForm($(this))) return false;
    var form = $(this);

    var formData = new FormData($(this)[0]);
    if(window.cad_element_config != undefined) {
        formData.append("config", JSON.stringify(window.cad_element_config));
    }

    const fileItems = $(document).find(form).find('.js-form-file');

    fileItems.each((i, el) => {
        const file = $(el).data('file');
        formData.append('files[' + i + ']', file);
    });

    var cb;
    if (typeof formData.get("ajaxCallback") !== "undefined")
        cb = window.ajaxCallback[formData.get("ajaxCallback")];
    else
        cb = function (container) {
        };
    window.sendAjax(formData, $(this), cb);
});

function validateForm(form) {
    $(form).find(".error").removeClass("error");
    var send = 1;
    $(form).find("[data-required]").each(function () {
        if ($(this).val() === "") {
            $(this).addClass("error");
            send = 0;
        }
    });

    $(form).find("[data-required-tel]").each(function () {
        if ($(this).val() === "" || $(this).val().length < 18) {
            $(this).addClass("error");
            send = 0;
        }
    });

    var email;
    form.find("[data-input-email]").each(function () {
        email = $(this).val();
        if (!validateEmail(email)) {
            $(this).addClass('error');
            send = 0;
        }

    });

    return send;
}

function validateEmail(email) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (email && reg.test(email) == false) {
        return false;
    }
    return true;
}

$(document).on('focus', 'input.error, textarea.error', function () {
    $(this).removeClass('error');
});

var sendAjax = window.sendAjax = function (data, container, cb) {
    if(data.get('ajaxCallback') == 'afterChangeMaterial') {
        beforeChangeMaterial(container);
    }
    $.ajax({
        type: "POST", url: "/local/ajax/",
        data: data, dataType: "json",
        cache: false, contentType: false, processData: false,
        success: function (data) {
            if(container) {
                container.removeClass('loading');
            }
            if (typeof cb === 'function')
                cb(container, data);
        }
    });
};

window.ajaxCallback.afterLoadBestOffers = function (container, data) {
    if (data.HTML && container.length) {
        container.html(data.HTML);
        afterAjax(container.find('.slider-products'));
        const tabBlockID = container.attr('data-tab-block-id');
        const tab = $('[data-tab-id=' + tabBlockID + ']');
        const tabBlock = $('[data-tab-block-id=' + tabBlockID + ']');
        tab.removeClass('ajax-link');
        tabBlock.removeAttr('style');
        toggleFavourite();
        setComparisionActive();
    }
};

window.ajaxCallback.afterAddToBasket = function (container, data) {
    if (data.STATUS == 'success') {
        window.modal.close('change-config');

        if (data['MODAL_TYPE'] != undefined && data['MODAL_TYPE'] == 'add-basket' && data.MODAL_HTML != undefined) {
            let params = data.INPUT;
            params.ajaxCallback = 'afterOpenModalAddToBasket';
            window.modal.openWithAjax(data['MODAL_TYPE'], params, data);
        } else {
            openModalSuccess(data);
        }

        if(data.ECOMMERCE) {
            addEcommerce(data.ECOMMERCE);
        }

        $('.js-count-basket-items').text(data.BASKET.COUNT);
        container.addClass('is-active');
        setTimeout(function () {
            container.removeClass('is-active');
        }, 2000);
    }
};

window.ajaxCallback.afterOpenModalAddToBasket = function(container, data) {
    $('.modal--basket .modal__main').html(data.MODAL_HTML);
    window.afterAjax();
}

window.ajaxCallback.afterBuyOneClick = function (container, data) {
    if(data.STATUS == 'need_auth') {
        sendSmsCodeAndContinueAction(container, data);
    } else if(data.STATUS == 'success') {
        if(data.ECOMMERCE) {
            addEcommerce(data.ECOMMERCE);
        }
        openModalSuccess(data);
    } else if (data.STATUS == 'error') {
        openModalSuccess(data);
    }
    window.modal.close('fast-order');
};

window.ajaxCallback.afterUserLogin = function (container, data) {
    if (data.STATUS == 'error') {
        if (data.ERROR_TYPE == 'login') {
            $('.form-group__input--login-name').addClass('error');
        }
        if (data.ERROR_TYPE == 'password') {
            $('.form-group__input--login-password').addClass('error');
        }
        container.find('.form-group__error-field').text(data.MESSAGE);
    }
    if (data.STATUS == 'success') {
        window.modal.close('login');
        location.reload();
    }
};

window.ajaxCallback.afterUserRegistration = function (container, data) {
    if (data.STATUS == 'error') {
        if (data.ERROR_TYPE == 'email') {
            $('.form-group__input--reg-email').addClass('error');
        }
        if (data.ERROR_TYPE == 'password') {
            $('.form-group__input--reg-password').addClass('error');
        }
        container.find('.form-group__error-field').html(data.MESSAGE);
    }
    if (data.STATUS == 'success') {
        window.modal.close('registration');
        openModalSuccess(data)
    }
};

function openModalSuccess(data) {
    let params = data.INPUT;
    params.ajaxCallback = 'afterOpenModalSuccess';
    window.modal.openWithAjax('success', params, data);
}

window.ajaxCallback.afterOpenModalSuccess = function (container, data) {
    $('.modal-success__title').html(data.TITLE);
    $('.modal-success__message').html(data.MESSAGE);
}

$(document).on('keyup', '.js-quick-search input', function () {
    var $this = $(this);
    clearTimeout(window.search_timer_id);
    var q = $(this).val();
    window.search_timer_id = setTimeout(function () {
        if (q.length > 2) {
            var formData = new FormData();
            formData.append('search', q);
            formData.append('action', 'Search/getSearchList');
            formData.append('ajaxCallback', 'ShowSearchList');
            if (typeof formData.get("ajaxCallback") !== "undefined"){
                cb = window.ajaxCallback[formData.get("ajaxCallback")];
            }
            else
                cb = function (container) {};
            window.sendAjax(formData, $this, cb);

/*
            formData.set('action', 'Search/getSearchListSections');
            formData.set('ajaxCallback', 'ShowSearchListSections');
            if (typeof formData.get("ajaxCallback") !== "undefined"){
                cb = window.ajaxCallback[formData.get("ajaxCallback")];
            }
            else
                cb = function (container) {};
            window.sendAjax(formData, $this, cb);
*/
        } else {
            $('.js-search-products-default').show();
            $('.js-search-products-custom').hide();
            $('.js-search-sections-default').show();
            $('.js-search-sections-custom').hide();
            $('.header-search__more').hide();
        }
    }, 300);
    return false;
});

window.ajaxCallback.ShowSearchList = function (container, data) {
    const productsDefault = $('.js-search-products-default');
    const productsCustom = $('.js-search-products-custom');
    const sectionsDefault = $('.js-search-sections-default');
    const sectionsCustom = $('.js-search-sections-custom');

    const headerSearchMore = $('.header-search__more');

    productsDefault.hide()
    sectionsDefault.hide();
    productsCustom.html(data.ITEMS).show();
    sectionsCustom.html(data.SECTIONS).show();
    toggleFavourite();
    setComparisionActive();
    window.afterAjax();

    if (data.SECTIONS) {
        headerSearchMore.slideDown();
        headerSearchMore.find('a').attr('href', '/search/?q=' + data.INPUT.search);
    } else {
        headerSearchMore.slideUp();
    }

    // var el = document.querySelector('.search-list__scroll');*/

    //window.newSimplebar(el);
};


$(document).on('keyup', '.js-search-locations-input', function () {
    var $this = $(this);
    clearTimeout(window.search_timer_id);
    var q = $(this).val();
    window.search_timer_id = setTimeout(function () {
            if (q.length > 2) {
                var formData = new FormData();
                formData.append('search', q);
                formData.append('action', 'Search/getSearchLocations');
                formData.append('ajaxCallback', 'ShowSearchLocations');
                if (typeof formData.get("ajaxCallback") !== "undefined")
                    cb = window.ajaxCallback[formData.get("ajaxCallback")];
                else
                    cb = function (container) {
                    };
                window.sendAjax(formData, $this, cb);
            } else {
                $('.search-list').html('').removeClass('is-active');
            }
        }
        , 300);
    return false;
});

window.ajaxCallback.ShowSearchLocations = function (container, data) {
    const searchList = container.parents('.js-search-locations').find('.search-list');
    if (data.ITEMS || true) {
        searchList.html(data.ITEMS).addClass('is-active');
    } else {
        searchList.html('').removeClass('is-active');
    }
    var el = document.querySelector('.search-list__scroll');
    window.newSimplebar(el);
};

window.ajaxCallback.afterCall = function (container, data) {
    if (data.STATUS == 'success') {
        window.modal.close('callback');
        openModalSuccess(data);
    }
    if(container.length) {
        container[0].reset();
    }
};

window.ajaxCallback.afterSubscribe = function (container, data) {
    if (data.STATUS == 'success') {
        $('.form__input--subscribe-email').val('');
        openModalSuccess(data);
    }
};

window.ajaxCallback.afterForgotPassword = function (container, data) {
    if (data.STATUS == 'success') {
        window.modal.close('forgot-password');
        openModalSuccess(data);
    }

    if (data.STATUS == 'error') {
        container.find('.form-group__error-field').html(data.MESSAGE);
        container.find('.form-group__input--login-email').addClass('error');
    }
};

$(document).on('click', '[data-show-more]', function (e) {
    e.preventDefault();
    $('.loader').addClass('is-active');

    const url = window.location.href;
    const btn = $(this);
    const data = btn.data();
    const bx_ajax_id = btn.attr('data-ajax-id');
    const block_id = "#comp_" + bx_ajax_id;
    const id = data.showMore;
    const currentPage = data.currentPage;
    const countPage = data.countPage;
    const page = Number(currentPage) + 1;
    var request = {
        bxajaxid: bx_ajax_id,
    };
    request['PAGEN_' + id] = page;

    $.ajax({
        type: "GET",
        url: url,
        data: request,
        success: function (data) {
            $(block_id).find('.section-catalog__grid').append($(data).find('.section-catalog__grid').children());
            if (page < countPage) {
                $(block_id).find('.js-show-more').after($(data).find('.js-show-more')).remove();
            } else {
                $(block_id).find('.js-show-more').remove();
            }
            window.afterAjax();

            var newUrl = addParams(url, 'PAGEN_' + id, page);
            newUrl = delParams(newUrl, 'bxajaxid');

            /*
            if(newUrl) {
                history.pushState(null, null, newUrl);
            }
             */

            if ($('.js-toggle').hasClass('is-active')) {
                $('[data-toggle="product"]').click();
            } else {
                $('.js-toggle-item[data-toggle="offer"]').trigger('click');
            }

            $('.loader').removeClass('is-active');
        }

    });
});

window.ajaxCallback.afterChangeFavourites = function (container, data) {
    if (data.STATUS == 'success') {
        const headerFavouriteCount = $('.js-favourite-num');
        if (data.TYPE == 'add') {
            container.addClass('is-active').data('active', 'Y').attr('data-active', 'Y');
        }
        if (data.TYPE == 'delete') {
            container.removeClass('is-active').data('active', '').attr('data-active', '');
        }

        if (data.COUNT) {
            headerFavouriteCount.removeClass('d-none');
        } else {
            headerFavouriteCount.addClass('d-none');
        }

        headerFavouriteCount.text(data.COUNT || '');
    }
};

window.ajaxCallback.afterGetAdditionalSection = function (container, data) {
    if (data.HTML) {
        let params = data.INPUT;
        params.ajaxCallback = 'afterOpenModalAdditionalSection';
        window.modal.openWithAjax('element-additional', params, data);
    }
};

window.ajaxCallback.afterOpenModalAdditionalSection = function (container, data) {
    if ($('.modal-element-additional .modal__main').length) {
        $('.modal-element-additional .modal__main').html(data.HTML);
        window.afterAjax();
    }
}

window.ajaxCallback.afterAddAdditionalElement = function (container, data) {
    if (data.HTML) {
        $('.trade-offers__item-row[data-section-Id="' + data.INPUT.sectionId + '"]').parents('.trade-offers__item').find('.trade-offers__list').append(data.HTML).show()
    }

    updateAdditionalElements();
    window.modal.close('element-additional');
    window.afterAjax();
    window.wrapperSticky.updateSticky()
    window.wrapper2Sticky.updateSticky()
};

function updateAdditionalElements() {
    window.cad_element_config.additional = [];
    $('#wrapper .js-min-card-product').each(function () {
        let offerId = $(this).attr('data-offer-id');
        if (offerId) {
            window.cad_element_config.additional.push({'id': offerId, 'count': 1});
        }
    })
}

window.ajaxCallback.afterRemoveAdditionalElement = function (container, data) {
    let item = $('.js-min-card-product[data-main-product-id="' + data.INPUT.mainProductId + '"][data-product-id="' + data.INPUT.productId + '"]');
    if (container.length) {
        container.each(function () {
            offersList = $(this).find('.trade-offers__list');
            if (offersList.find('.min-card-product').length == item.length) {
                offersList.slideUp(function() {
                    $(this).html('');
                });
            } else {
                item.slideUp(400, "swing", function () {
                    item.remove();
                });
            }
        })
    }
    updateAdditionalElements()
};

window.ajaxCallback.afterGetElementConfig = function(container, data) {
    window.afterAjax();

    const event = new Event('update-options');
    document.dispatchEvent(event);

    const basesEl = $('.js-element-bases-input:checked');

    window.cad_element_config.bases = {
        'id': basesEl.val(),
        'price': basesEl.attr('data-price'),
        'name' : basesEl.attr('data-name'),
    };

    window.cad_element_config.options = [];
    const optionsEl = $('.js-element-option-input:checked');
    optionsEl.each(function() {
        window.cad_element_config.options.push({
            'id': $(this).val(),
            'price': $(this).attr('data-price'),
            'name': $(this).attr('data-name')
        });
    })

};


window.ajaxCallback.afterShowInstock = function (container, data) {
    let params = data.INPUT;
    params.ajaxCallback = 'afterOpenModalInStock';
    window.modal.openWithAjax('in-stock', params, data);
};

function beforeChangeMaterial(container) {
    container.find('input').prop('checked', true);
    let parent = container.parents('.config-item');
    parent.find('.js-item-config').each(function () {
        $(this).removeClass('checkbox--selected');
        $(this).addClass('ajax-link')
    });
    if (container.length) {
        container.addClass('checkbox--selected');
        container.removeClass('ajax-link');
    }
}

window.ajaxCallback.afterChangeMaterial = function (container, data) {

    let productId = data.INPUT.productId;
    let offerId = data.OFFER_ID;

    let footingsName;
    let materialId;
    try {
        footingsName = data.RESULT.SELECTED_OFFER.FOOTINGS.UF_NAME;
    } catch(e) {}
    try {
        materialId = data.RESULT.SELECTED_OFFER.MATERIAL.ID;
    } catch(e) {}

    window.cad_element_config.offer_id = offerId;
    window.cad_element_config.prices = data.PRICES;

    changeOffer(productId, offerId);
    changeImages(data);

    if (data.SELECT_SIZE_ELEMENT_DESKTOP_HTML) {
        $('.js-product-detail-select-size-desktop').html(data.SELECT_SIZE_ELEMENT_DESKTOP_HTML);
    }

    if (data.SELECT_ELEMENT_CONFIG_SIZE_HTML) {
        $('#js-element-config-sizes').html(data.SELECT_ELEMENT_CONFIG_SIZE_HTML);
    }

    if (data.OPTIONS_ELEMENT_HTML) {
        $('#js-element-options').html(data.OPTIONS_ELEMENT_HTML);
    }

    if (data.CONFIG_ELEMENT_HTML) {
        $('#js-element-config').html(data.CONFIG_ELEMENT_HTML);
    }

    if (data.MATERIALS_ELEMENT_HTML) {
        $('#js-element-config-material').html(data.MATERIALS_ELEMENT_HTML);
    }

    if (data.FOOTINGS_ELEMENT_HTML) {
        $('#js-element-config-footings').html(data.FOOTINGS_ELEMENT_HTML);
    }

    changePrices();
    changeProductDetailUrl();

    if(data.TYPE == 'material') {
        const configMaterialHintBlock = $(document).find(container).parents('.config-item').find('.config-item__select-text--material');
        configMaterialHintBlock.attr('data-config-selected', data.MATERIAL_NAME)
            .data('config-selected', data.MATERIAL_NAME);
        configMaterialHintBlock.find('.if-open-hide').text(data.MATERIAL_NAME);
    }

    if(data.TYPE == 'footings' && footingsName) {
        const configFootingsHintBlock = $(document).find(container).parents('.config-item').find('.config-item__select-text--footings');
        configFootingsHintBlock.attr('data-config-selected', footingsName)
            .data('config-selected', footingsName);
        configFootingsHintBlock.find('.if-open-hide').text(footingsName);
    }

    if(materialId) {
        $('[data-selected-offer-material]').each((index, el) => {
            $(el).attr('data-selected-offer-material', materialId).data('selected-offer-material', materialId);
        });
    }

    if (offerId) {
        let newUrl = addParams(location.href, 'offerId', data.OFFER_ID);
        history.pushState(null, null, newUrl);
    }

    window.afterAjax();
};

function loadOptions(offerId, $this) {
    var formData = new FormData();
    formData.append('action', 'Element/getOptions');
    formData.append('ajaxCallback', 'afterGetElementOptions');

    formData.append("config", JSON.stringify(window.cad_element_config));

    var data = $this.data();
    $.each(data, function (index, value) {
        formData.append(index, value);
    });

    if (typeof formData.get("ajaxCallback") !== "undefined") {
        cb = window.ajaxCallback[formData.get("ajaxCallback")];
    } else {
        cb = function (container) {
        };
    }
    window.sendAjax(formData, $this, cb);
}

window.ajaxCallback.afterGetElementOptions = function (container, data) {
    if (data.OPTIONS_ELEMENT_HTML) {
        $('#js-element-options').html(data.OPTIONS_ELEMENT_HTML);
        window.afterAjax();
    }

    changeImages(data);
    if(data.REFERER_OFFER_ID != undefined) {
        changeRefererOfferId(data.REFERER_OFFER_ID);
    }

    window.cad_element_config.options = [];
    if(data.OPTIONS.BASES != undefined) {
        window.cad_element_config.bases = {};
        data.OPTIONS.BASES.forEach(function(bases) {
            if(bases.ID != undefined && bases.SELECTED != undefined && bases.SELECTED) {
                window.cad_element_config.bases = {
                    'id': bases.ID,
                    'price': bases.PRICES.PRICE,
                    'name': bases.NAME
                };
            }
        })
    }

    if(data.OPTIONS.OPTIONS != undefined) {
        window.cad_element_config.options = [];
        data.OPTIONS.OPTIONS.forEach(function(option) {
            if(option.SELECTED != undefined && option.SELECTED) {
                window.cad_element_config.options.push({
                    'id': option.ID,
                    'price': option.PRICES.PRICE,
                    'name': option.NAME
                });
            }
        })
    }

    if (data.SELECT_SIZE_ELEMENT_DESKTOP_HTML) {
        $('.js-product-detail-select-size-desktop').html(data.SELECT_SIZE_ELEMENT_DESKTOP_HTML);
    }

    if (data.SELECT_ELEMENT_CONFIG_SIZE_HTML) {
        $('#js-element-config-sizes').html(data.SELECT_ELEMENT_CONFIG_SIZE_HTML);
    }

    changeConfigElementOptions();
    changePrices();
    changeProductDetailUrl();
}

function changeConfigElementOptions() {
    $('.js-config-bases-text').text(window.cad_element_config.bases.name);
    if(window.cad_element_config.options.length) {
        $('.js-config-options-text').text('Выбрано: (' + window.cad_element_config.options.length + ')')
    } else {
        $('.js-config-options-text').text('Не выбрано');
    }
    const parentOptions = $('#config-type--options');
    if(parentOptions.length) {
        let countVisibleOptions = parentOptions.find('[data-config-item]:not(.d-none)').length
        if(countVisibleOptions) {
            $('.product-detail-card__flex--options').removeClass('d-none')
        } else {
            $('.product-detail-card__flex--options').addClass('d-none')
        }
    }
    if(typeof(window.configChangeHeight) == 'function') {
        configChangeHeight();
    }
}


function changeImages(data) {
    //Смена картинки в товаре
    if (data.OFFER_IMAGE_HTML && $('.js-element-offer-image').length) {
        $('.js-element-offer-image').after(data.OFFER_IMAGE_HTML).remove();
    }

    //Смена картинок оффера в конфигураторе
    if (data.OFFER_IMAGE_CONFIG_HTML && $('.js-element-config-image').length) {
        $('.js-element-config-image').after(data.OFFER_IMAGE_CONFIG_HTML).remove();
    }

    //Смена картинок оффера в мобильной версии конфигуратора
    if(data.OFFER_CONFIG_IMAGE_MOBILE && $('.js-offer-config-image-mobile').length) {
        $('.js-offer-config-image-mobile').after(data.OFFER_CONFIG_IMAGE_MOBILE).remove();
    }
}

function changeRefererOfferId(refererOfferId) {
    $('[data-referer-offer-id]').each(function() {
        $(this).attr('data-referer-offer-id', refererOfferId).data('referer-offer-id', refererOfferId);
    })
}

$(document).on('click', '.js-add-to-cart-btn', function () {
    var formData = new FormData();

    var data = $(this).data();
    $.each(data, function (index, value) {
        formData.append(index, value);
    });

    if(window.cad_element_config != undefined) {
        formData.append("config", JSON.stringify(window.cad_element_config));
    }

    if (typeof formData.get('ajaxCallback') !== "undefined") {
        cb = window.ajaxCallback[formData.get('ajaxCallback')];
    } else {
        cb = function (container) {
        };
    }
    window.sendAjax(formData, $(this), cb);
});

window.ajaxCallback.afterGetReviews = function (container, data) {
    if (data.STATUS == 'success' && data.HTML) {
        $('.reviews-section__list').append(data.HTML);
        let page = Number(data.INPUT.currentPage) + 1;
        let countPage = Number(data.INPUT.countPage);
        if (container.length) {
            if (page >= countPage) {
                container.remove()
            } else {
                container.attr('data-current-page', page).data('current-page', page)
            }
        }
        window.afterAjax();
        window.wrapperSticky.updateSticky()
        window.wrapper2Sticky.updateSticky()
    }
}

window.ajaxCallback.afterAddProductReview = function (container, data) {
    if (data.STATUS == 'success') {
        window.modal.close('reviews');
    }
    openModalSuccess(data);
}

function requireJivo(openOnLoad=false) {
   let script = "//code.jivosite.com/widget/pXyTEA0OXO";
    $.ajax({
        url: script,
        dataType: "script",
        async: false,
        success: function () {
            if(openOnLoad) {
                setTimeout(function() {
                    jivo_api.open();
                    $(document).find('.js-open-jivo-api').attr('href', 'javascript:jivo_api.open()');
                }, 1000)
            }
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

function addEcommerce(e) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(e);
}


window.ajaxCallback.afterAddArticleMark = function ($obj, data) {
    if(data.STATUS == 'success') {
        if($obj.length) {
            const $objContainer = $obj.parents('.js-rating-form-container');
            const $objTitle = $objContainer.find('.js-rating-form-title');
            $objTitle.text('Ваша оценка');

        }
    }
}

window.ajaxCallback.AfterAddLike = function ($obj, data) {
    if(data.STATUS == 'success') {
        if($obj.length) {
            $obj.find('.like-btn__number').text(data.COUNT);
        }
    }
}

window.ajaxCallback.AfterLoadBlogProductsModal = function ($obj, data) {
    if(data.HTML && $('.js-modal-products').length) {
        $('.js-modal-products').html(data.HTML);
        modal.open('foto-products');
        window.afterAjax();
    }
}

function getStoreAvailable(productId, cityId) {
    var formData = new FormData();
    formData.append('action', 'LoadBlocks/getStoreAvailable');
    formData.append('ajaxCallback', 'afterGetStoreAvailable');
    formData.append('productId', productId);
    formData.append('cityId', cityId);

    if (typeof formData.get("ajaxCallback") !== "undefined") {
        cb = window.ajaxCallback[formData.get("ajaxCallback")];
    }
    window.sendAjax(formData, null, cb);
}

window.ajaxCallback.afterGetStoreAvailable = function ($obj, data) {
    if (data.SHOPS) {
        var shopsCount = Object.keys(data.SHOPS).length;
        if (shopsCount > 0) {
            var productNames = ['магазине', 'магазинах', 'магазинах'];
            var htm = 'в ' + numWord(shopsCount, productNames);
            window.instock = data.SHOPS;
            $('.btn-view__accent').html(htm);
            $('.js-store-available').show();
        }
    }
    if(data.DELIVERY_HTML) {
        $('.js-product-delivery-info').html(data.DELIVERY_HTML);
    }
}

window.ajaxCallback.afterOpenModalInStock = function (container, data) {
    var htm = '';
    var shops = window.instock;
    var coords = [];
    for (var id in shops) {
        htm += '<div class="card-contacts">\n' +
            '<div class="card-contacts__row">\n' +
            '<b>' + shops[id].NAME + '</b> ' + shops[id].PROPERTY_ADDRESS_VALUE + '\n' +
            '</div>\n' +
            '<div class="card-contacts__row"><span class="text-accent">' + shops[id].PROPERTY_TIME_VALUE + '</span>, <a href="tel:' + shops[id].PROPERTY_PHONE_VALUE.replace(/[^+\d]/g, '') + '">' + shops[id].PROPERTY_PHONE_VALUE + '</a></div>\n';
        coords.push(shops[id].PROPERTY_COORDS_VALUE);
        for (var offId in shops[id]['OFFERS']) {
            var offer = shops[id]['OFFERS'][offId];
            var prop = offer['SIZE'];
            if (offer['COLOR'] !== null) {
                prop += ', ' + offer['COLOR'];
            }
            htm += '<div class="card-contacts__row"><b>' + offer['NAME'] + ':</b> ' + prop + '</div>\n';
        }
        htm += '</div>\n';

    }
    $('#cardContacts').html(htm);
    if (($('#instock-map').html()).trim() == "") {
        var script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        document.getElementById('cardContacts').after(script);
        script.onload = function () {
            ymaps.ready(init);
        }
    }

    function init() {
        var myMap = new ymaps.Map("instock-map", {
            center: ["56.845476", "41.380247"],
            zoom: 13,
            controls: ['smallMapDefaultSet']
        });
        const placemark = {};
        var coord = [];
        for (var c in coords) {
            coord = coords[c].split(',');
            placemark[c] = new ymaps.Placemark(coord,
                {
                    balloonContent: '',
                },
                {
                    preset: 'islands#redDotIcon',
                });
            myMap.geoObjects.add(placemark[c]);
        }
        myMap.behaviors.disable('scrollZoom');
        if (coords.length > 1) {
            myMap.setBounds(myMap.geoObjects.getBounds(), {
                checkZoomRange: true,
                zoomMargin: 35
            });
        } else {
            myMap.setCenter(coord, 13);
        }

    }
}

function loadShops(city) {
    if($('.js-shop-list').length) {
        var formData = new FormData();
        formData.append('action', 'LoadBlocks/getShopList');
        formData.append('ajaxCallback', 'afterGetShopList');
        formData.append('city', city);
        formData.append('windowWidth', $(window).width());

        if (typeof formData.get("ajaxCallback") !== "undefined") {
            cb = window.ajaxCallback[formData.get("ajaxCallback")];
        }
        window.sendAjax(formData, null, cb);
    }
}

window.ajaxCallback.afterGetShopList = function (container, data) {
    if($('.js-shop-list').length && data.SHOP_LIST_HTML != undefined) {
        $('.js-shop-list').html(data.SHOP_LIST_HTML);
    }

    if($('.js-store-map').length && data.MAP_HTML != undefined) {
        $('.js-store-map').html(data.MAP_HTML);
    }
}

$(document).on('keyup', '[data-location-input]', function () {
    var $this = $(this);
    clearTimeout(window.location_timer_id);
    var search = $(this).val();
    window.location_timer_id = setTimeout(function () {

            var formData = new FormData();
            formData.append('search', search);
            formData.append('action', 'Location/getLocationsByString');
            formData.append('ajaxCallback', 'AfterGetLocations');
            formData.append('siteId', 's1');
            if (typeof formData.get("ajaxCallback") !== "undefined")
                cb = window.ajaxCallback[formData.get("ajaxCallback")];
            else
                cb = function (container) {
                };
            window.sendAjax(formData, $this, cb);
        }
        , 300);
    return false;
})

window.ajaxCallback.AfterGetLocations = function (container, data) {
    var html = '';
    var item;

    const parent = container.parents('.location');
    const searchList = parent.find('.search-list');
    if(data.RESULT.length) {
        //html += '<div>'
        html += '<div class="search-list__scroll custom-scroll">';
        for (var key in data.RESULT) {
            item = data.RESULT[key];
            html += '<div class="search-list__item js-location-item" data-code="' + item.CODE + '">';
            if(item.NAME) {
                html += item.NAME + ', ';
            }
            if(item.REGION_NAME) {
                html += item.REGION_NAME + ', ';
            }
            if(item.COUNTRY_NAME) {
                html += item.COUNTRY_NAME;
            }
            html += '</div>';
        }
        html += '</div>';
        searchList.addClass('is-active')
    } else {
        searchList.removeClass('is-active');
        const inputHidden = parent.find('input[type=hidden]');
        inputHidden.val('').trigger('change');
    }
    searchList.html(html)
}

window.ajaxCallback.afterOrderSave = function (container, data) {
    if(data.STATUS == 'need_auth') {
       sendSmsCodeAndContinueAction(container, data);
    } else if(data.STATUS == 'success') {
        container[0].reset();
        openModalSuccess(data);
        if(data.INPUT.orderSuccessPath && data.ORDER_ID) {
            setTimeout(function () {
                location.href = data.INPUT.orderSuccessPath + '?ORDER_ID=' + data.ORDER_ID;
            }, 2000);
        }
        if(data.INPUT.isOrderExamples) {
            localStorage.removeItem('FabricClothSelected');
        }
    }
}

function sendSmsCodeAndContinueAction(container, data) {
    let phone = data.INPUT.phone.replace(/[^+\d]/g, '');

    let formData = new FormData;
    $.each(data.INPUT, function (index, value) {
        if(index[0] !== '~') {
            formData.append(index, value);
        }
    });

    var cb;
    if (typeof formData.get("ajaxCallback") !== "undefined") {
        cb = window.ajaxCallback[formData.get("ajaxCallback")];
    } else{
        cb = function (container) {};
    }

    let params = {
        phone: phone,
        do_not_reload: true,
        action: () => window.sendAjax(formData, container, cb)
    };
    window.openModalCode(params)
}

function loadCardPicture(_this) {
    let offerId = _this.attr('data-offer-id');
    let refererOfferId = _this.attr('data-referer-offer-id');
    const parent = _this.parents('.js-card-product');
    parent.find('.js-select-sizes-link').each(function() {
        $(this).attr('data-referer-offer-id', offerId).data('referer-offer-id', offerId);
    });

    var formData = new FormData();
    formData.append('action', 'Element/getCardImage');
    formData.append('offerId', offerId);
    formData.append('refererOfferId', refererOfferId);

    let cb = window.ajaxCallback['AfterGetCardImage'];

    window.sendAjax(formData, _this, cb);
}

window.ajaxCallback.AfterGetCardImage = function (container, data) {
    if(data.CARD_OFFER_IMAGE_HTML != undefined) {
        const parent = container.parents('.js-card-product');
        const offerImage = parent.find('[data-offer-image] picture');
        if(offerImage.length) {
            offerImage.after(data.CARD_OFFER_IMAGE_HTML).remove();
        }
    }
}

window.modalOpen = function (name, props) {
    const modals = JSON.parse(localStorage.getItem('modalsName'));
    localStorage.setItem('modalsProps', JSON.stringify(props));
    modals[`${name}`] = true;
    localStorage.setItem('modalsName', JSON.stringify({...modals}));
    document.dispatchEvent(window.eventVueModal);
}
$('[data-modal-vue]').on('click',function (){
    window.modalOpen($(this).data('modal-vue'), $(this).data())
})

window.ajaxCallback.AfterLoadSizes = function (container, data) {
    if(data.HTML != undefined && container.length) {
        const loaderClass = 'loader-in loader-in--accent'
        const select = container.html(data.HTML).parents('.select-size')
        select.addClass(loaderClass)
        setTimeout(() => {
            select.removeClass('ajax-link');
            select.attr('data-select');
            let selectClass = window.thisSelectInit(select)
            selectClass.open()
            selectClass.dom.body.find('.js-select-sizes-link')[0].classList.add('active');
            selectClass.dom.el.removeClass(loaderClass)
        }, 100)
    }
}

window.ajaxCallback.afterGetCloudTagsAdmin = function (container, data) {
    if(data.HTML != undefined && container.length) {
        container.html(data.HTML);
        container.addClass('cloud-tags-more');
    }
}

$(document).on('change', '.js-update-seo-url', function() {
    let formData = new FormData;
    var data = $(this).data();
    $.each(data, function (index, value) {
        formData.append(index, value);
    });

    formData.append('type', $(this).prop('checked') ? 'add' : 'remove');

    if (typeof formData.get('ajaxCallback') !== "undefined") {
        cb = window.ajaxCallback[formData.get('ajaxCallback')];
    } else {
        cb = function (container) {
        };
    }
    window.sendAjax(formData, $(this), cb);
})

window.ajaxCallback.afterRegisterYandexId = function (container, data) {
   if(data.error) {
       if($(container).length) {
           if(typeof(data.display_message) != 'string') {
               data.display_message = 'Ошибка авторизации. Повторите попытку позже'
           }
           $(container).html('<div class="yandex-error">' + data.display_message + '</div>');
           let parent = $(container).parents('.modal__inner');
           parent.find('.separator').remove();
           parent.find('.btn-yandex').css('height', 'auto');

       }
   } else {
       location.reload();
   }
}