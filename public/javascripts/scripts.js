

$(document).ready(function(){

    $(".filter-button").click(function(){
        let value = $(this).attr('data-filter');

        if(value === "all") {
            //$('.filter').removeClass('hidden');
            $('.filter').show('1000');
        }
        else {
//          $('.filter[filter-item="'+value+'"]').removeClass('hidden');
//          $(".filter").not('.filter[filter-item="'+value+'"]').addClass('hidden');
            $(".filter").not('.'+value).hide('3000');
            $('.filter').filter('.'+value).show('3000');

        }
    })

    $("#ex2").slider()

    $("#ex10").slider({})



})

$("#ex16b").slider({ min: 0, max: 10, value: [0, 10], focus: true });


