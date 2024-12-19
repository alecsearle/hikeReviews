# OG VERSION
from flask import Flask, request, g
from hikes import HikeDB
from passlib.hash import bcrypt
from session_store import SessionStore

app = Flask(__name__)
session_store = SessionStore()
db=HikeDB("hikes_db.db")
print("db", db)

def load_session_data():
    auth_header = request.headers.get("Authorization")
    print("AUTH HEADER", auth_header)
    session_id = None
    session_data = None
    
    if auth_header and auth_header.startswith("Bearer "):
        session_id = auth_header.removeprefix("Bearer ")
        print("IN AUTH HEADER IF STATEMENT", session_id)
    
    if session_id:
        session_data = session_store.get_session_data(session_id)
        print("GETTING SESSION DATA", session_data)

    if session_id == None or session_data == None:
        # Create a new session and session data
        session_id = session_store.create_session()
        print("CREATED NEW SESSION ID", session_id)
        session_data = session_store.get_session_data(session_id)

    g.session_id = session_id
    g.session_data = session_data


@app.before_request
def before_request_func():
    if request.method == "OPTIONS":
        response = app.response_class("", status=204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    load_session_data()

@app.after_request
def after_request_func(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/sessions", methods=["GET"])
def retrieve_session():
    session_data = g.session_data
    return {
        'id': g.session_id,
        'data': session_data
    }, 200, {"Access-Control-Allow-Origin": "*"}


@app.route("/hikes", methods=["GET"])
def retrieve_reviews():
    # Allow CORS
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    db=HikeDB("hikes_db.db")
    print("db", db)
    reviews = db.getHikes()
    return reviews, {"Access-Control-Allow-Origin" : "*"}

@app.route("/hikes", methods=["POST"])
def create_review():
    print("The request data is: ", request.form)
    name = request.form["name"]
    location = request.form["location"]
    miles = request.form["miles"]
    rating = request.form["rating"]
    review = request.form["review"]
    picture = request.form["picture"]
    db = HikeDB("hikes_db.db")
    db.createHike(name, location, miles, rating, review, picture)
    return "Created", 201, {"Access-Control-Allow-Origin" : "*"}

@app.route("/hikes/<int:hike_id>", methods=["PUT"])
def update_hike(hike_id):
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401

    db = HikeDB("hikes_db.db")
    
    # Check if the hike exists
    hike = db.getHike(hike_id)  # Removed user_id parameter
    if not hike:
        return f"Hike with ID {hike_id} not found", 404
    
    # Get form data and validate
    name = request.form.get("name")
    location = request.form.get("location")
    miles = request.form.get("miles")
    rating = request.form.get("rating")
    review = request.form.get("review")
    picture = request.form.get("picture")

    if not all([name, location, miles, rating, review, picture]):
        return "All fields are required", 400
    
    try:
        db.updateHike(hike_id, name, location, miles, rating, review, picture)  # Removed user_id
        return "Updated", 200
    except Exception as e:
        print(f"Error updating hike: {e}")
        return "Failed to update hike", 500


@app.route("/hikes/<int:hike_id>", methods=["DELETE"])
def delete_hike(hike_id):
    print("deleting hike with ID", hike_id)
    db = HikeDB("hikes_db.db")
    hike = db.getHike(hike_id)
    if hike:
        db.deleteHike(hike_id)
        return "Deleted", 200, {"Access-Control-Allow-Origin" : "*"}
    else:
        return f"Hike with {hike_id} not found", 404, {"Access-Control-Allow-Origin" : "*"}

@app.route("/hikes/<int:hike_id>", methods=["GET"])
def retreive_hike(hike_id):
    db = HikeDB("hikes_db.db")
    hike = db.getHike(hike_id)
    if hike:
        return hike, 200, {"Access-Control-Allow-Origin" : "*"}
    else:
        return f"Hike with id {hike_id} not found", 404, {"Access-Control-Allow-Origin" : "*"}

@app.route("/users", methods=["POST"])
def create_user():
    print("The request data is: ", request.form)
    first_name = request.form["first_name"]
    last_name = request.form["last_name"]
    email = request.form["email"]
    password = request.form["password"]
    db = HikeDB("hikes_db.db")
    # need to encrypt password before storing in DB
    # check if email has already been used to avoid duplicate accounts
    if db.getUserByEmail(email):
        return f"User with email {email} already exists.", 422, {"Access-Control-Allow-Origin" : "*"}
    else:
        encrypted_password = bcrypt.hash(password)
        db.createUser(first_name, last_name, email, encrypted_password)
        return "User Created", 201, {"Access-Control-Allow-Origin" : "*"}
    
@app.route("/sessions/auth", methods=["POST"])
def login_user():
    print("The request data is: ", request.form)
    email = request.form["email"]
    password = request.form["password"]
    db = HikeDB("hikes_db.db")
    user = db.getUserByEmail(email)
    
    if user and bcrypt.verify(password, user['password']):
        g.session_data["user_id"] = user["id"]
        session_id = g.session_id
        return {
            "message": "Authenticated",
            "session_id": session_id
        }, 201, {"Access-Control-Allow-Origin": "*"}  # Include CORS header here
    
    return "Unauthorized", 401, {"Access-Control-Allow-Origin": "*"}  # Include CORS header here


@app.route("/sessions/settings", methods=["PUT"])
def setFavoriteColor():
    print("the request color is : ", request.form)
    color = request.form["color"]
    g.session_data["fav_color"] = color
    return "Color Saved", 200


def run():
    app.run(port=8000)
if __name__ == "__main__":
    run()