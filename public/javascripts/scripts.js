function myFunction(url) {
    window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400")
}


$().ready(() => {
    $('[rel="tooltip"]').tooltip()

});

function rotateCard(btn){
    let $card = $(btn).closest('.card-container')
    console.log($card)
    if($card.hasClass('hover')) $card.removeClass('hover')
    else $card.addClass('hover')
}