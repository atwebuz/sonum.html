$(document).ready(function() {
    initSuggestion()
});

function initSuggestion(city) {
    var city = city || $('[data-location-input]').val().split(',')[0] || 'Москва';
    $("[data-suggestion]").suggestions({
        token: 'e01cff22195f27df614d89f377698b03177c586e',
        type: "ADDRESS",
        constraints: {
            label: "",
            locations: {
                city: city
            }
        },
        count: 3,
        // в списке подсказок не показываем область и город
        restrict_value: true
    });
}

// 6a441ccd8197d45b2088a0fb15233a4ae09e9f0a
//