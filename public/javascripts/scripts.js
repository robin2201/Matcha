$().ready(() => {
    $('[rel="tooltip"]').tooltip()

})

function rotateCard(btn){
    let $card = $(btn).closest('.card-container')
    if($card.hasClass('hover')) $card.removeClass('hover')
    else $card.addClass('hover')
}


function myfunction() {
    setTimeout(500)
    window.location.reload()
}