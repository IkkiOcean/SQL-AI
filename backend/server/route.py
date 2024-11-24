
from flask import request, jsonify
from flask_cors import cross_origin
from server import app
from server.util import connect_to_sql, get_chain


@app.route('/ask', methods=['POST'])
@cross_origin()
def ask():
    if request.method == 'POST':
        data = request.get_json()
        query = data['query']
        if query:
            try:
                result = get_chain(db, query)
                return jsonify(answer = result, status = 200)
            except:
                return jsonify(answer = "Something went wrong", status = 400)

@app.route('/connect', methods=['POST'])
@cross_origin()
def connect():
    data = request.json
    try:
        global db
        db=connect_to_sql(db_stats=data['form_data'], url= data['sql_link'])
        
    except:
        return "Error connecting to database", 400
    return "Connected to database", 200

@app.route('/.')
@cross_origin()
def start():
    return "SQL AI Backend Working", 200