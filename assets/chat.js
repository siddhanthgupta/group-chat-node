$(function () {
    var socket = io();
    var username = null;
    var totalUsers = 0;
    // For the time now
    Date.prototype.timeNow = function () {
        return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" +
            ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" +
            ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
    }

    function updateUsers(users) {
        $('#user-list').empty();
        if (users.indexOf(username) > -1) {
            $('#user-list').append($('<li>').append($('<a href="#">').text("You")));
        }
        totalUsers = users.length;
        $("#new-user-count").text((String)(totalUsers));
        $("#new-user-count").show();
        for (var i in users) {
            if (users[i].localeCompare(username) != 0)
                $('#user-list').append($('<li>').append($('<a href="#">').text(users[i])));
        }
    };

    function createTextMessage(message, user, timestamp) {
        /*
        <div class="header">
            <strong class="primary-font">Jack Sparrow</strong> <small class="pull-right text-muted">
                <span class="glyphicon glyphicon-time"></span>12 mins ago</small>
        </div>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare
            dolor, quis ullamcorper ligula sodales.
        </p>
        */
        return $('<div>').append(
            $('<div class="header">').append(
                $('<strong class="primary-font">').text(user)).append(
                $('<small class="pull-right">').text(timestamp + " ").append(
                    $('<span class="glyphicon glyphicon-time">')))
        ).append(
            $('<p>').text(message)
        );
    }

    function createSentMessage(message, timestamp) {
        /* <div class="row">
            <div class="col-md-4" style="padding-left: 100px;">
                <div class="bubble-send">
                    Hello
                </div>
            </div>
            <div class="col-md-8"></div>
        </div>

        */
        var currentdate = new Date(timestamp);
        var datetime = currentdate.timeNow();

        $('#message-list').append(
            $('<div class="row">').append(
                $('<div class="col-md-4" style="padding-left: 100px;">').append(
                    $('<div style="padding-top=15px;padding-bottom=15px">').append(
                        $('<div class="bubble-send">').append(createTextMessage(message, "You", datetime))
                    )
                )
            ).append(
                $('<div class="col-md-8">')
            )
        );
    };

    function createReceivedMessage(message, sender, timestamp) {
        /* <div class="row">
            <div class="col-md-8"></div>
            <div class="col-md-4">
                <div class="bubble-receive">

                </div>
            </div>
        </div>
        */
        var currentdate = new Date(timestamp);
        var datetime = currentdate.timeNow();

        $('#message-list').append(
            $('<div class="row">').append($('<div class="col-md-8">')).append(
                $('<div class="col-md-4" >').append(
                    $('<div class="bubble-receive">').append(createTextMessage(message, sender, datetime))
                )
            )
        );
    };

    $('#chat-form').submit(function () {
        socket.emit('chat message', $('#m').val());
        var sentmessage = $('#m').val();
        console.log(sentmessage)
            // $('#chatbox').append($('<div>').text(sentmessage).class("bubble");
        $('#m').val('');
        return false;
    });


    $('#message-typed').keydown(function (event) {
        if (event.keyCode == 13) {
            sendMessage();
            return false;
        }
    });


    $(".dropdown-toggle").on("click", function (event) {
        console.log("You clicked ");
        console.log(event);
    });

    function sendMessage() {
        var currentdate = new Date();
        var timestamp = currentdate.getTime();
        var sentmessage = {};
        sentmessage.message = $('#message-typed').val();
        sentmessage.timestamp = timestamp;
        sentmessage.sender = username;
        socket.emit('chat message', sentmessage);
        createSentMessage(sentmessage.message, timestamp);
        console.log(sentmessage)
            // $('#chatbox').append($('<div>').text(sentmessage).class("bubble");
        $('#message-typed').val('');
    };

    $('#send-message').on("click", function () {
        if ($('#message-typed').val().length > 0)
            sendMessage();
        return false;
    });

    socket.on('chat message', function (message) {
        // $('#messages').append($('<li>').text(message));
        if (readyFlag) {
            createReceivedMessage(message.message, message.sender, message.timestamp);
        }
    });

    socket.on('change-users', function (users) {
        updateUsers(users);
    });

    $(window).load(function () {
        $('#login-modal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#login-modal-error').hide();
        $('#user-list-dropdown').hide();
        totalUsers = 0;
        readyFlag = false;
        // $('#username-header').hide();
        // $('#username-header-glyph').hide();
    });

    $("#login-form").submit(function (event) {
        console.log("In submit function");
        var namedata = {};
        namedata.name = $("#name").val();
        namedata.id = socket.id;
        console.log("Socket ID is " + socket.id);
        console.log("Got name as " + namedata.name);
        console.log(namedata);
        $.ajax({
            type: "POST",
            url: "/login",
            contentType: 'application/json',
            data: JSON.stringify(namedata),
            // context: document.body,
            success: function (data) {
                var response = jQuery.parseJSON(data);
                console.log(response);
                if (response.valid) {
                    $('#login-modal').modal('hide');
                    username = namedata.name;
                    console.log("Username set as " + username);
                    // $('#username-header').show();
                    // $('#username-header-glyph').show();
                    $("#username-header").text("Logged in as " + username);
                    $("#login-form-submit").removeClass("btn-primary");
                    $("#login-form-submit").addClass("btn-success");
                    $('#login-modal-error').hide();
                    $('#user-list-dropdown').show();

                    updateUsers(response.users);
                    readyFlag = true;

                } else {
                    // $('#login-modal-error').addClass("alert-danger");
                    // $('#login-modal-error').removeClass("alert-success");
                    if (response.validation == 1)
                        $('#login-modal-error').text("Please enter a valid username");
                    else if (response.validation == 2)
                        $('#login-modal-error').text("Username already taken. Please try another name.");
                    $('#login-modal-error').show();
                }

            },
            error: function (xhr, status, error) {
                console.log('Error: ' + error.message);
            }
        });
        event.preventDefault();
    });

    $("#login-form-submit").on("click", function () {
        $("#login-form").submit();
        return false;
    });

});
