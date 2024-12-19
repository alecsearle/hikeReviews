import sqlite3

def dict_factory(cursor, row):
 fields = []
 # Extract column names from cursor description
 for column in cursor.description:
    fields.append(column[0])

 # Create a dictionary where keys are column names and values are row values
 result_dict = {}
 for i in range(len(fields)):
    result_dict[fields[i]] = row[i]

 return result_dict

class HikeDB:
    def __init__(self, filename):
        #connect to DB file
        self.connection = sqlite3.connect(filename)
        self.connection.row_factory = dict_factory

        #use the connection instance to perform db operations
        #create a cursor instance for the connection
        self.cursor = self.connection.cursor()

    def getHikes(self):
        #now that we have an access point we can fetch all or one
        #ONLY applicable use of fetch is following a SELECT query
        self.cursor.execute("SELECT * FROM hikes")
        hikes = self.cursor.fetchall()
        return hikes
    
    def getHike(self, hike_id):
        data = [hike_id]
        self.cursor.execute("SELECT * FROM hikes WHERE id = ?", data)
        hike = self.cursor.fetchone()
        return hike
    
    def createHike(self, name, location, miles, rating, review, picture):
        data = [name, location, miles, rating, review, picture]
        #add a new hike to our db
        self.cursor.execute("INSERT INTO hikes(name,location,miles,rating,review,picture)VALUES(?,?,?,?,?,?)", data)
        self.connection.commit()

    def updateHike(self, hike_id, name, location, miles, rating, review, picture):
       data = [name, location, miles, rating, review, picture, hike_id]
       self.cursor.execute("UPDATE hikes SET name = ?, location = ?, miles = ?, rating = ?, review = ?, picture = ? WHERE id = ?", data)
       self.connection.commit()

    # DELETE FUNCTION #
    def deleteHike(self, hike_id):
       data = [hike_id]
       self.cursor.execute("DELETE FROM hikes WHERE id = ?", data)
       self.connection.commit()


    def createUser(self, first_name, last_name, email, password):
        data = [first_name, last_name, email, password]
        #add a new user to our db
        self.cursor.execute("INSERT INTO users(first_name, last_name, email, password)VALUES(?,?,?,?)", data)
        self.connection.commit()

    def getUserByEmail(self, email):
       data = [email]
       self.cursor.execute("SELECT * FROM users WHERE email = ?", data)
       user = self.cursor.fetchone()
       return user
    
    def loginUser(self, email, password):
       data = [email, password]
       self.cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", data)
       user = self.cursor.fetchone()
       return user
