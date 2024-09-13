# TrackMyDay
This app will help you to track your daily activities and will provide you with insights on how you are spending your time. It can help you to identify areas where you are wasting time and make changes to be more productive. This helped me to become more productive instead of spending on entertainment 6-8% a day.

https://github.com/VinoV1999/TrackMyDay/assets/123581387/cece9a50-121a-445d-b397-0d4bf5a9a850


some of the React Concepts Have Used in this project are listed below
# 1. useState
To store and update data based on the needs, useState hooks have been used in almost each JSX page.
# 2. useEffect
On load of each page i have to fetch the data that was stored in a firebase. For that, and to keep the timer update after a second useEffect hook concept is used.
# 3. useMemo
While comparing the task activities. There are many possibilities that the user can select a particular task which results in multiple rendering of the same data. To avoid the unnecessary rendering useMemo hook was implemented.
# 4. useContext and  HOC
To access the value of the user login details through out the components. I have used useContext hook in authContext.js. Also the concept of Higher Order Component(HOC) too used in the file to manage the authentication of the user. If the use intensionally tries to access any page without login this will detect and navigate to LogIn page. Also a concept of named exports is also used in this file.
# 5. Condition Rendering 
To show and hide a few components on screen based on the condition. Have implemented the concept of conditional rendering which helps to render needful components according to the user action.
# 6. HOC 
authContext.js is an Higher Order Component. have used it to manage the authentication of the user. If the use intensionally tries to access any page without login this will detect and navigate to LogIn page. Also a concept of named exports is also used in this file.
# 7. React Router
Track My Day is a small application but has three pages like Home, View and Compare. To create a new page and navigate around them, I have implemented React Router.



# Firebase Google Authentication
To authenticate the user have used Firebase Google Authentication. This helps to authenticate the user with their google account.
# Firestore Database
To store the user's activities have used Firebase Firestore Database. This helps to store the user data in the cloud and can be accessed from anywhere with any devices.

# Chart.js
To show the user's activities in graphical format have used Chart.js. This helps the user to get a clear view on their day to day tasks and is easy to understand.

