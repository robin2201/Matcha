$( () => {
    let socket = io()

    $('#test').submit( () => {
        let pseudo = $('#idto').val()
        let message =  $('#m').val()
        let idRoom = $('#idRoom').val()
        let nickname = $('#nicknameSocket').val()
        if(message === '' || idRoom === '' || nickname === '') return false
        socket.emit("id to", idRoom, message, nickname)
        socket.emit('chat message', message, nickname)

        $('#m').val('')
        return false
    })
    socket.on('chat message', (messNick) => {
        let mess = messNick.mess
        let nickname = messNick.nick
        //$('.test1').append($('<img class="img-circle" src="http://api.adorable.io/avatar/33/"+nickname>'))
        $('.test1').append($('<strong>').text(nickname))
        $('.test1').append($('<li>').text(mess))
        window.scrollTo(0, document.body.scrollHeight)
    })
    // socket.on('nickname', nickname => {
    //     $('.socketUsername').append(text(nickname))
    //     window.scrollTo(0, document.body.scrollHeight)
    // })
})
