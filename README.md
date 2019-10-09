# TASK

## How to use it

- Clone this repo: ``
- `cd task.odt`
- `npm install` to install required packages
- Modify database connection according to your machine in `.env`
- `npm start` to start the server

## API (JSON): 
  - /signin [POST] - request for bearer token by id and password
  - /signup [POST] - creation of new user
    - Fields id and password. Id - phone number or email. After signup add field `id_type` - phone or email
	- In case of successful signup - return token
  - /info [GET] - returns user id and id type
  - /latency [GET] - returns service server latency for google.com
  - /logout [GET] - with param `all`:
    - true - removes all users bearer tokens
	- false - removes only current token
