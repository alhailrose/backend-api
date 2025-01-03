# Application Programming Interface Aplikasi Pendeteksi Penyakit Tanaman

## API DOCUMENTATION

| Route                           | HTTP Method | Description                |
| ------------------------------- | ----------- | -------------------------- |
| /signup                         | POST        | Sign up a new user         |
| /signin                         | POST        | Sign in a user             |
| /signout                        | POST        | Sign out a user            |
| /users                          | GET         | Get all users              |
| /users/:user_id                 | GET         | Get user by ID             |
| /users/update-users/:user_id    | PUT         | Update user name and email |
| /users/change-password/:user_id | PUT         | Change user password       |
| /sharing                        | POST        | Add sharing content        |
| /sharing                        | GET         | Get all sharing content    |
| /sharing/:sharing_id            | GET         | Get sharing by ID          |
| /sharing/:sharing_id            | PUT         | Update sharing by ID       |
| /sharing/:sharing_id            | DELETE      | Delete sharing by ID       |
