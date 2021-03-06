$(document).ready(function() {

    firebaseDatabase.init();

});

var constants = {
    gameReference : "game/",
    userReference : "user/",
    isPlayingReference : "/isPlaying",
    hasFinishedReference : "/hasFinished",
    cityReference : "/city",
    usersReference : "/users",
    wordReference : "/word",
    value : "value",

    cityId : "#city-text",
    phoneId : "#phone-text",
    nameId : "#name-text",
    codeId : "#code-text",
    buttonId : "#form-button",

    cityRefill : "#city-refill",
    gameIdInput : "#game_id_input",
    userIdInput : "#user_id_input",
    scoreDiv : "#score-div",
    wordRefill : "#word-refill"
}

var firebaseDatabase = {

    init: function() {
        var config = {
            apiKey: "AIzaSyAhoYEMnBrO-nNB_50LimITrkWHvwAcipM",
            authDomain: "copenhacks2017.firebaseapp.com",
            databaseURL: "https://copenhacks2017.firebaseio.com",
            projectId: "copenhacks2017",
            storageBucket: "copenhacks2017.appspot.com",
            messagingSenderId: "1097292714945"
        };
        firebase.initializeApp(config);
    }

}

var gameDatabase = {

    writeGame : function(gameId, city, userAdminId) {
        console.log('New Game at: ' + constants.gameReference + gameId);
        firebase.database().ref(constants.gameReference + gameId).set({
            city: city,
            isPlaying: false,
            hasFinished: false,
            admin: userAdminId
        });
        firebase.database().ref(constants.gameReference +
                                gameId +
                                constants.usersReference + '/' +
                                userAdminId).set(0, function(error) {
                                    if (error) {
                                        alert('Something went wrong...');
                                    } else {
                                        window.location = '/' + gameId + '/' + userAdminId;
                                    }
                                });
        return true;
    },


    updatePlayingGame : function(gameId, isPlaying) {
        var updates = {};
        updates['/' + constants.gameReference +
                gameId +
                constants.isPlayingReference] = isPlaying;

        return firebase.database().ref().update(updates);
    },

    updateFinishedGame : function(gameId, hasFinished) {
        var updates = {};
        updates['/' + constants.gameReference +
                gameId +
                constants.hasFinishedReference] = hasFinished;

        return firebase.database().ref().update(updates);
    },

    updateScore : function(gameId, userId) {
        firebase.database().ref(constants.gameReference +
                                gameId +
                                constants.usersReference + '/' +
                                userId).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting user score: ' + snapshot.val());
                    if (snapshot.val() != null) {
                        firebase.database().ref(constants.gameReference +
                                                gameId +
                                                constants.usersReference + '/' +
                                                userId).set(snapshot.val() + 1, function(error) {
                                                    if (error) {
                                                        alert('Something went wrong...');
                                                    } else {
                                                        window.location = '/' + gameId + '/' + userId;
                                                    }
                                                });
                    } else {
                        alert('Something went wrong...');
                    }
                });

    },

    updateWord : function(gameId, word) {
        var updates = {};
        console.log('Updating at: ' + '/' + constants.gameReference + gameId + constants.wordReference);
        updates['/' + constants.gameReference +
                gameId +
                constants.wordReference] = word;

        return firebase.database().ref().update(updates);
    },

    notifyWhenPlayingChanges : function(gameId, userId) {

        var gamePlayingRef = firebase.
                database().ref( constants.gameReference +
                                gameId);
        gamePlayingRef.on('child_changed', function(snapshot) {
            console.log('Into listener: ' + snapshot.val());
            gameDatabase.setWord(gameId);
            gameDatabase.setCityGame(gameId);
            gameDatabase.setUserScore(gameId, userId);
        });
        gamePlayingRef.on('child_added', function(snapshot) {
            console.log('Into listener: ' + snapshot.val());
            gameDatabase.setWord(gameId);
            gameDatabase.setCityGame(gameId);
            gameDatabase.setUserScore(gameId, userId);
        });
    },

    notifyWhenWordChanges : function(gameId, userId) {
        var ref = firebase.database().ref(constants.gameReference + gameId + '/word');
        ref.on('value', function(snapshot) {
            if (snapshot.val() != null && snapshot.val().length >= 2) {
                $.ajax({
                    url: '/call/' + userId + '/' + snapshot.val()
                }).done(function(content){
                    console.log('Message sent to ' + userId + 'with ' + snapshot.val());
                });
            }
        });
    },

    setCityGame : function(gameId) {
        firebase.database().ref(constants.gameReference + gameId + constants.cityReference).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting city name: ' + snapshot.val());
                    $(constants.cityRefill).html(snapshot.val());
                });
    },

    setUserScore : function(gameId, userId) {
        firebase.database().ref(constants.gameReference +
                                gameId +
                                constants.usersReference + '/' +
                                userId).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting user score: ' + snapshot.val());
                    if (snapshot.val() != null) {
                        $(constants.scoreDiv).html(snapshot.val());
                    }
                });
    },

    setWord : function(gameId) {
        firebase.database().ref(constants.gameReference + gameId + constants.wordReference).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting word: ' + snapshot.val());
                    $('#word_input').val(snapshot.val());
                    $(constants.wordRefill).html(snapshot.val());
                });
    },

    getWord : function(gameId) {
        firebase.database().ref(constants.gameReference + gameId + constants.wordReference).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting word to input: ' + snapshot.val());
                    $('#word_input').val(snapshot.val());
                });
    },

    increaseScore : function(gameId, userId) {
        console.log('Increasing score');
        gameDatabase.updatePlayingGame(gameId, false);
        gameDatabase.updateWord(gameId, '?');
        gameDatabase.updateScore(gameId, userId);
    },

    startTimer : function(gameId) {
        var date = new Date();
        date = new Date(date.getTime() + 10*60*1000);
        console.log('Time: ' + date);

        var updates = {};
        console.log('Updating at: ' + '/' + constants.gameReference + gameId + '/time');
        updates['/' + constants.gameReference +
                gameId + '/time'] = date;

        return firebase.database().ref().update(updates);
    },

    setTimer : function(gameId) {
        firebase.database().ref(constants.gameReference + gameId + '/time').once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting time: ' + snapshot.val());
                    // TODO Insert into countdown
                });
    },

    start : function(gameId) {
        gameDatabase.updatePlayingGame(gameId, true);
        gameDatabase.startTimer(gameId);
        $.ajax({
            url: '/static/wordList.txt'
        }).done(function(content){
            lines = content.replace(/\r\n|\r/g, '\n').trim().split('\n');
            gameDatabase.updateWord(gameId, lines[Math.floor(Math.random()*lines.length)]);
        });
    },

    setAdminUser : function(gameId, userId) {
        firebase.database().ref(constants.gameReference + gameId + '/admin').once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting admin: ' + snapshot.val());
                    if (snapshot.val() != userId) {
                        $('#button-start').attr('hidden', true);
                    }
                });
    },

    setIsPlaying : function(gameId, userId) {
        firebase.database().ref(constants.gameReference + gameId + constants.isPlayingReference).once(constants.value)
                .then(function(snapshot) {
                    console.log('Into getting isPlaying: ' + snapshot.val());
                    if (snapshot.val()) {
                        $('#button-start').text('STOP');
                        $('#button-start').css('background-color', 'red');
                    } else {
                        $('#button-start').text('START');
                        $('#button-start').css('background-color', 'green');
                    }
                });
    }
}

var userDatabase = {

    writeUser : function(userId, name) {
        console.log('New User at: ' + constants.userReference + userId);
        firebase.database().ref(constants.userReference + userId).set({
            name: name
        });
        return true;
    },

    joinUser : function(userId, gameId) {
        console.log('Join User at: ' + constants.gameReference + gameId + constants.usersReference + '/' + userId);
        firebase.database().ref(constants.gameReference +
                                gameId).once(constants.value)
                                .then(function(snapshot) {
                                    if (snapshot.val() != null) {
                                        firebase.database().ref(constants.gameReference +
                                                                gameId +
                                                                constants.usersReference + '/' +
                                                                userId).set(0, function(error) {
                                                                    if (error) {
                                                                        alert('Something went wrong...');
                                                                    } else {
                                                                        window.location = '/' + gameId + '/' + userId;
                                                                    }
                                                                });
                                    } else {
                                        alert('Something went wrong...');
                                    }
                                });
    },

    getUserName : function(userId) {
        return firebase.database().ref(constants.userReference + userId).once(constants.value)
                .then(function(snapshot) {
                  return snapshot.val().name;
                });
    }

}

var utils = {

    makeId : function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

}