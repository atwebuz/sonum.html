let startPosition = 0;
const scrollContainer = document.querySelector('.tabs-list')

const scrollToEl = (el) => {
    if (!el) return

    const elPosition = el.offsetLeft;
    scrollContainer.scrollTo({
        top: 0,
        left: elPosition,
        behavior: "smooth"
    });

}
const scrollToActiveTab = () => {
    const activeTab = document.querySelector('.tabs-list__item--active');
    const prevActive = document.querySelector('.tabs-list__item:has(+ .tabs-list__item--active)');
    const resultTab = document.querySelector('.tabs-list__item--result');
    const prevResult = document.querySelector('.tabs-list__item:has(+ .one-more-time)');
    const resultBtn = document.querySelector('.one-more-time');
    startPosition = !prevResult ? prevActive.offsetLeft : prevResult.offsetLeft - 100
    scrollContainer.scrollTo(startPosition, 0)

    if (resultBtn) {
        console.log(resultBtn.offsetLeft)
        return
    }
    if (!activeTab) {
        scrollToEl(resultTab)
        return
    }
    scrollToEl(activeTab)
}


$(document).on('change', '.js-configurator-radio', function (e) {
    e.preventDefault();
    const parent = $(this).parents('.js-configurator-form');
    const questions = parent.find('.js-configurator-question');

    const checkedQuestions = questions.find('.js-configurator-radio:checked');


    if (checkedQuestions.length == questions.length) {
        let step = $(this).attr('data-step');
        let goto = $(this).attr('data-goto');
        let goal = $(this).attr('data-goal');

        if (goto) {
            let fields = {};
            let result = {};

            checkedQuestions.each((i, el) => {
                let questionId = $(el).attr('data-id');
                result[questionId] = {
                    'title' : $(el).attr('data-title'),
                    'question' : $(el).attr('data-question'),
                    'answer' : $(el).attr('data-answer')
                }

                fields[questionId] = $(el).val();

            });
            let formData = new FormData();
            let action = 'LoadBlocks/getConfigurator';
            if (goto == 'result') {
                action = 'LoadBlocks/getConfiguratorResult';
            }
            formData.append('action', action);
            formData.append('step', step);
            formData.append('goto', goto);
            formData.append('fields', JSON.stringify(fields));
            formData.append('result', JSON.stringify(result));

            if(typeof(ym) == 'function' && goal != undefined) {
                ym(29749712,'reachGoal', goal)
            }

            $.ajax({
                type: "POST",
                url: "/local/ajax/",
                data: formData, dataType: "json",
                cache: false, contentType: false, processData: false,
                success: function (data) {
                    if (data.HTML) {

                        if (data.STATUS == 'result') {
                            $('#configurator-main').html(data.HTML)
                            step = 'result'
                            window.afterAjax()
                            window.inputMask()
                        } else {
                            $('#configurator-main').find('.order-page__left').html($(data.HTML).find('.order-page__left').html());
                            $('#configurator-main').find('.tabs-list').html($(data.HTML).find('.tabs-list').html());
                        }
                    }

                    scrollToActiveTab(scrollContainer, startPosition)

                    $.cookie('conf-matras', step, {domain: getCookieDomain(), path: '/'});
                },
                error: function (e) {
                    console.log(e);
                }
            });

        }
    }
})

function loadConfiguratorResult(type) {
    let formData = new FormData();
    formData.append('action', 'LoadBlocks/getConfiguratorResult');
    formData.append('type', 'matras');
    formData.append('extra', 'Y');

    $.ajax({
        type: "POST",
        url: "/local/ajax/",
        data: formData, dataType: "json",
        cache: false, contentType: false, processData: false,
        success: function (data) {
            if (data.HTML) {
                $('#show-more-configurator-container').html($(data.HTML).find('.mattress-choice__title-min--extra'));
                $('#show-more-configurator-container').append($(data.HTML).find('.cards-mattresses'));
                $('.js-show-configurator-extra-result-btn').slideUp();
                afterAjax($('#show-more-configurator-container').find('.slider-products'));
            }
            //$('.sidebar .one-more-time').removeClass('none');
            //$.cookie('conf-matras', 'result', {domain: getCookieDomain(), path: '/'});
        }
    });
}

$(document).on('click', '.tabs-list__item--done', function (e) {
    e.preventDefault();
    let step = $(this).attr('data-step');
    $.cookie('conf-matras', step, {domain: getCookieDomain(), path: '/'});
    location.reload()
})
/*
$(document).on('click', '.tabs-list__item--result', function(e) {
    e.preventDefault();
    loadConfiguratorResult('matras');
})
 */

$(document).on('click', '.js-show-configurator-extra-result-btn', function (e) {
    e.preventDefault();
    $(this).addClass('loader-in');
    loadConfiguratorResult('matras');
})


$(document).on('click', '.one-more-time', startConfig)

function startConfig() {
    $.cookie('conf-matras', 'step1', {domain: getCookieDomain(), path: '/'});
    location.reload();
}

window.ajaxCallback.afterSendPromo = function (container, data) {
    if (data.STATUS == 'need_auth') {
        sendSmsCodeAndContinueAction(container, data);
    } else {
        container[0].reset();
        let parent = container.parents('.js-promo__container');
        parent.find('.js-promo__title').text(data.message);
        if (data.status == 'success') {
            if(typeof(ym) == 'function') {
                ym(29749712,'reachGoal', 'getPromoCod')
            }
            parent.find('input[type=tel]').prop('disabled', true);
            parent.find('button').prop('disabled', true);

            let count = 120;
            const timeout = setInterval(function () {
                if (count <= 0) {
                    parent.find('input[type=tel]').prop('disabled', false);
                    parent.find('button').prop('disabled', false);
                    parent.find('.js-promo__text').text(`Отправить код повторно`);
                    clearInterval(timeout);
                    return
                }
                parent.find('.js-promo__text').text(`Отправить повторно, через ${count} сек`);
                count--;
            }, 1000)
        }
    }
}

function delAttr(url, attrName) {
    var res = '';
    var d = url.split("#")[0].split("?");

    var base = d[0];
    var query = d[1];
    var newUrl;
    if (query) {
        var params = query.split("&");
        for (var i = 0; i < params.length; i++) {
            var keyval = params[i].split("=");
            if (keyval[0] != attrName) {
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

function setAttr(attrName, attrVal) {
    var url = location.href;
    var newUrl;
    url = delAttr(url, attrName);
    if (url.indexOf('?') > 0) newUrl = url + '&';
    else newUrl = url + '?';
    newUrl = newUrl + attrName + '=' + attrVal;
    return newUrl;
}