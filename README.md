## Live Site Link: https://highwayhoppers.vercel.app/home

## Frontend Code: https://github.com/ImranHossain1/highway-hoppers-frontend

## Backend Root Api: https://travel-ageny-backend.vercel.app/api/v1/

## Authentication:

1. Admin Authentication:

```bash
      email: imran@gmail.com
      password: admin123
```

### User Authentication:

- /auth/signUp (POST) //Sign up
- /auth/signIn (POST) //SIGN IN
- /user/my-profile (GET) //GET USER PROFILE (AUTHENTICATED)
- /user/update-profile (PATCH) UPDATE USER PROFILE (AUTHENTICATED)
- /user/update-profile (PATCH) UPDATE USER PROFILE (AUTHENTICATED)
- /auth/change-password (PATCH) UPDATE USER PASSWORD (AUTHENTICATED)

### Driver:

- /driver/:userId (POST) //CREATE DRIVER WITH HIS SALARY

  ####sample Data

```json
{
  "salary": 25000
}
```

- /driver/:userId GET SINGLE DRIVER'S DATA
- /driver/:userId UPDATE SINGLE DRIVER'S DATA ONLY ADMIN AND SUPER_ADMIN CAN DO THIS
  ####sample Data

```json
{
  "salary": 25000
}
```

### Bus/BusSit:

- /bus (POST) //CREATE BUS (AUTHENTICATED (ADMIN \ SUPER_ADMIN)) - ALSO UPDATE BUS SITS
  ```json
  {
    "busNumber": "B0004",
    "totalSit": 10,
    "busType": "Non_AC"
  }
  ```
- /bus (GET) //GET ALL BUS (AUTHENTICATED (ADMIN \ SUPER_ADMIN)) -
- /bus/:id (GET) //GET SINGLE BUS (AUTHENTICATED (ADMIN \ SUPER_ADMIN))
- /bus/:id (UPDATE) //UPDATE SINGLE BUS (AUTHENTICATED (ADMIN \ SUPER_ADMIN)) - ALSO UPDATE BUS SITS
  ```json
  {
    "busNumber": "B0004",
    "totalSit": 10,
    "busType": "Non_AC"
  }
  ```

### BUS SCHEDULE:

- /bus-schedule (POST) //CREATE BUS SCHEDULE (AUTHENTICATED (ADMIN \ SUPER_ADMIN))

```json
{
  "startTime": "15:10",
  "endTime": "18:10",
  "startDate": "2023-10-30",
  "endDate": "2023-10-30",
  "startingPoint": "Shylet",
  "endPoint": "Chittagang",
  "dayOfWeek": "Monday",
  "busFare": 800,
  "driverId": "09e55a4e-6162-4124-a35a-b78127853870",
  "busId": "0b8bf7a9-8376-4702-8e5a-d887f794cca8"
}
```

- /bus-schedule/?sortOrder=asc&sortBy=busFare (GET) //GET ALL BUS SCHEDULE (AUTHENTICATED (ADMIN \ SUPER_ADMIN))
- /bus-schedule/:id (GET) GET SINGLE BUS SCHEDULE (AUTHENTICATED (ADMIN \ SUPER_ADMIN))
- /bus-schedule/:id/delete-schedule (DELETE) DELETE BUS SCHEDULE (AUTHENTICATED (ADMIN \ SUPER_ADMIN))
- /bus-schedule/:id/update-schedule (PATCH) UPDATE BUS SCHEDULE (AUTHENTICATED (ADMIN \ SUPER_ADMIN))
- /bus-schedule/:busScheduleId/update-status UPDATE BUS SCHEDULE STATUS (AUTHENTICATED (ADMIN \ SUPER_ADMIN))

```json
{
  "status": "Arrived"
}
```

## USER BOOKING

- /booking/create-booking (POST) //CREATE MULTIPLE SIT BOOKING ON PARTICULAR JOURNEY

```json
sample input:
{
    "sits": [
        {
            "bus_SitId": "b41df0c7-dded-45ba-b048-efdf0d4003a4"
        },
        {
            "bus_SitId": "d48b7daa-a0ee-47a6-a463-c0275dd3bbcf"
        }
    ],
    "busScheduleId": "871e098b-4da4-4a4d-aa89-e708ef6b7d57"
}
```

- /booking/complete-booking (PATCH) COMPLETE ALL PENDING BOOKING OF PARTICULAR USER
- /booking/get-all-Pending-Booking (GET) GET ALL PENDING BOOKING OF PARTICULAR USER
- /booking/get-user-bookings (GET) GET ALL FILTERABLE BOOKINGS OF PARTICULAR USER
- /booking/get-all-bookings (GET) GET ALL FILTERABLE BOOKINGS (ADMIN, SUPER ADMIN)
- /booking/cancel-all-pending-booking (DELETE) CANCEL ALL PENDING BOOKING OF A PARTICULAR USER (ONLY THAT USER CAN DO THIS)
- /booking/:bookingId/cancel-single-pending-booking ADMIN OR SUPER ADMIN CAN DELETE PARTICULAR PENDING BOOKING

### REVIEW

- /review/:bookingId (POST) PARTICULAR USER OF THIS BOOKING CAN REVIEWED HIS JOURNEY

```json
{
  "review": "Best Journey ever",
  "rating": 5
}
```

- /review/:reviewId (GET) GET PARTICULAR REVIEW (OPEN)
- /review (GET) GET ALL EXISTING REVIEW (OPEN)
- /review/:reviewId (PATCH) UPDATE USER'S REVIEW - ALSO UPDATE DRIVERS RATING (ONLY PARTICULAR USER CAN DO THIS)

```json
{
  "review": "Best Journey ever",
  "rating": 5
}
```

- /review/:reviewId (DELETE) DELETE USER'S REVIEW - ALSO UPDATE DRIVERS RATING (ONLY PARTICULAR USER CAN DO THIS)
