# Hike Review WebApp

## Resource
**Resource Name**: Hike Review

### Attributes:
- **name** (string): The name of the hike.
- **location** (string): The location of the hike.
- **miles** (float): The total distance of the hike in miles.
- **rating** (integer): The rating of the hike on a scale of 1 to 5
- **review** (string): A review of the hike.
- **picture** (string): A URL link to a picture of the hike.

## Database Schema
```sql
CREATE TABLE hikes (
    id INTEGER PRIMARY KEY,
    name TEXT,
    location TEXT,
    miles FLOAT,
    rating INTEGER,
    review TEXT,
    picture TEXT
);

## Database Schema
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email FLOAT,
    password INTEGER,
);

## REST Endpoints

Name                           | Method | Path
-------------------------------|--------|------------------
Retrieve Hikes Reviews         | GET    | /hikes
Retrieve Hike Review           | GET    | /hikes/*\<hike_id\>*
Create Hike Review             | POST   | /hikes
Update Hike Review             | PUT    | /hikes/*\<hike_id\>*
Delete Hike Review             | DELETE | /hikes/*\<hike_id\>*
Retrieve Sessions              | GET    | /sessions
Create User                    | POST   | /users
Login User                     | POST   | /sessions/auth
Set Fav Color                  | PUT    | /sessions/settings


### Resources:
- **Bcrypt**
- **Flask**
