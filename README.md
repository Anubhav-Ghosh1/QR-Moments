# Diner's Find
# Installation
```
npm install
```
# Run
```
npm run dev
```

# Diner's Find API Reference

**Version**: CURRENT  
**Description**: Diner's Find is currently a backend project intended to learn how geolocation works.

---

## User API

### Register User
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/users/registerUser`
- **Description**: Used for registering a new user.
- **Body**: `form-data`
  - `fullName`: Anubhav
  - `email`: email
  - `username`: username
  - `accountType`: Customer
  - `password`: 12345678
  - `location[type]`: Point
  - `location[coordinates][0]`: 77.1025
  - `location[coordinates][1]`: 28.7041
  - `avatar`: /path/to/avatar.jpg
  - `coverImage`: /path/to/coverImage.jpg

### Login User
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/users/login`
- **Description**: Used for logging in a user.
- **Body**: `raw (json)`
  ```json
  {
      "username": "username",
      "email": "email",
      "password": "12345678"
  }
### Change Password
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/users/changePassword`
- **Description**: Checks if the user exists and updates the password.
- **Body**: `raw (json)`
  ```json
  {
      "oldPassword": "123456789",
      "newPassword": "12345678"
  }
  
 ### Update Account Details
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/users/updateAccountDetails`
- **Description**: Updates the user's account details.
- **Body**: `raw (json)`
  ```json
  {
      "fullName": "Anubhav",
      "email": "email",
      "accountType": "Customer"
  }
### Update Avatar
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/users/updateAvatar`

### Update Cover Image
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/users/updateCoverImage`

### Refresh Token
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/users/refreshToken`
- **Description**: Refreshes the user's access token.

### Get User
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/users/getUser`
- **Description**: Returns the current user.

### Search By Username
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/users/getUserByName/:username`
- **Description**: Searches for a user by username.
- **Path Variables**:
  - `username`

### Logout User
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/users/logout`

---

## Restaurant API

### Register Restaurant
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/restaurant/registerRestaurant`
- **Description**: Registers a new restaurant (unique by name).
- **Body**: `form-data`
  - `restaurantName`: Restaurant Name
  - `address`: Address
  - `phoneNo`: Phone Number
  - `location[type]`: Point
  - `location[coordinates][0]`: Longitude
  - `location[coordinates][1]`: Latitude
  - `logo`: `/path/to/logo.png`

### Get Restaurant By ID
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/restaurant/getRestaurant/:id`
- **Path Variables**:
  - `id`

### Get Nearby Restaurants
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/restaurant/nearByRestaurant`

### Get Food By Restaurant
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/restaurant/getFoodByRestaurant/:id`
- **Path Variables**:
  - `id`

### Add Food
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/restaurant/addFood`
- **Body**: `form-data`
  - `restaurantId`: Restaurant ID
  - `name`: Dosa
  - `price`: 100
  - `category`: India
  - `description`: Dosa
  - `isAvailable`: true
  - `foodImage`: `/path/to/food_image.png`

### Update Food Details
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/restaurant/updateFoodDetails`

### Delete Restaurant
- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/v1/restaurant/deleteRestaurant`

### Delete Food Details
- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/v1/restaurant/deleteFoodDetails`
- **Body**: `raw (json)`
  ```json
  {
      "id": "6702d1cded521439de84f208",
      "restaurantId": "6702ceaf505cb5e56cd29f4d"
  }
 ## Order API

### Create Order
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/v1/orders/create`
- **Body**: `raw (json)`
  ```json
  {
      "restaurantId": "6702d46ef968062663d1ca2e",
      "foods": [
          {
              "foodId": "6702d2f4fc5b4f3f47051f5b",
              "quantity": 2
          }
      ]
  }
### Get Bill
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/orders/bill/:orderId/:coupon?`
- **Path Variables**:
  - `orderId`: The unique identifier of the order.
- **Query Parameters**:
  - `coupon`: (Optional) The coupon code to apply to the bill.

### Track Order
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/orders/track/:orderId`
- **Path Variables**:
  - `orderId`: The unique identifier of the order.

### Update Order Status
- **Method**: `PATCH`
- **URL**: `http://localhost:4000/api/v1/orders/update-status/:orderId`
- **Path Variables**:
  - `orderId`: The unique identifier of the order.
- **Body**: `raw (json)`
  ```json
  {
      "newStatus": "Preparing"
  }
 ### Get User History
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/v1/orders/user/history`
- **Description**: Retrieves the order history for the current user.
