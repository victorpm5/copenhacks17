import Config, ComputerVision, Twilio, os
from random import choice
from string import ascii_lowercase, digits
from flask import Flask, render_template, jsonify, flash, redirect, request, url_for, send_file

UPLOAD_FOLDER = './img/'
RANDOM_NAME = ascii_lowercase + digits
NAME_LENGTH = 32

app = Flask(__name__)
app.config.from_object(Config)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RANDOM_NAME'] = RANDOM_NAME
app.config['NAME_LENGTH'] = NAME_LENGTH
app.secret_key = "BIENE_HACKUPC"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/create-game')
def create_game():
    return render_template('createGame.html')


@app.route('/join-game')
def join_game():
    return render_template('joinGame.html')


@app.route('/<game_id>/<user_id>')
def room_game(game_id, user_id):
    return render_template('roomGame.html', game_id=game_id, user_id=user_id)


@app.route('/get_pic/<game_id>/<user_id>/<word>', methods=['GET', 'POST'])
def get_pic(game_id, user_id, word):
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        filereq = request.files['file']
        if filereq.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if filereq:
            filename = os.path.join(app.config['UPLOAD_FOLDER'], ''.join(
                choice(app.config['RANDOM_NAME']) for i in range(app.config['NAME_LENGTH'])))
            filereq.save(filename)

            # root = request.url_root
            trobat = True  # ComputerVision.LookForObject(root + filename[2:], word)
            return redirect('/punctuation/' + str(trobat) + '/' + game_id + '/' + user_id)

    else:
        return render_template('getPic.html', game_id=game_id, user_id=user_id, word=word)


@app.route('/punctuation/<trobat>/<game_id>/<user_id>')
def punctuation(trobat, game_id, user_id):
    return render_template('punctuation.html', trobat=trobat, game_id=game_id, user_id=user_id)


@app.route('/img/<img>')
def get_img(img):
    return send_file(UPLOAD_FOLDER + img, mimetype='image/jpeg')


@app.route('/call/<user_id>/<word>')
def call_twilio(user_id, word):
    Twilio.sendMessage(user_id, 'Your next objective is ' + word)
    return 'OK'


if __name__ == '__main__':
    app.run()
