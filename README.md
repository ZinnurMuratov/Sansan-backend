# nodejs-rest-api-app
Example of using express.js for building REST API

### How to start
```sh
git clone https://github.com/alikhil/nodejs-rest-api-app
cd nodejs-rest-api-app
npm install
# run mongo server and put url to config file.
node index.js
```

### How to check?

After application launch. Check next links:

[http://localhost:3535/api/v1/signup?name=zinnur&password=12345](http://localhost/api/v1/signup?name=zinnur&password=12345)

[http://localhost:3535/api/v1/auth?name=zinnur&password=12345](http://localhost/api/v1/auth?name=zinnur&password=12345)

[http://localhost:3535/api](http://localhost:3535/api) - this link should return 404 error

[http://localhost:3535/api/v1/users](http://localhost:3535/api/v1/users) - this link should only to authorized users. Attach token in `Auhtorization` header

[http://localhost:3535/api/v2/users](http://localhost:3535/api/v2/users)

[http://localhost:3535](http://localhost:3535)
