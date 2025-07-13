# User Journey Diagrams

## 🛤️ Complete User Journey

```mermaid
journey
    title TravelAI User Journey
    section Discovery
      Visit Website: 5: User
      Browse Destinations: 4: User
      Read Reviews: 4: User
      Sign Up: 3: User
    section Planning
      Describe Dream Trip: 5: User
      AI Generates Itinerary: 5: User, AI
      Customize Itinerary: 4: User
      Get Recommendations: 5: User, AI
    section Booking
      Select Flights: 4: User
      Choose Hotels: 4: User
      Add Activities: 3: User
      Make Payment: 2: User
    section Travel
      Receive Documents: 5: User
      Check-in Reminders: 4: User, System
      Real-time Updates: 4: User, System
      Emergency Support: 3: User, Support
    section Post-Travel
      Leave Reviews: 3: User
      Share Experience: 4: User
      Get Future Recommendations: 5: User, AI
      Loyalty Rewards: 4: User, System
```

## 🔍 Flight Booking Journey

```mermaid
flowchart TD
    START([User Visits Flights Page]) --> SEARCH{Search Flights}
    SEARCH --> RESULTS[View Search Results]
    RESULTS --> FILTER[Apply Filters]
    FILTER --> SELECT[Select Flight]
    SELECT --> DETAILS[View Flight Details]
    DETAILS --> BOOK{Book Flight?}
    
    BOOK -->|Yes| LOGIN{Logged In?}
    BOOK -->|No| RESULTS
    
    LOGIN -->|No| AUTH[Login/Register]
    LOGIN -->|Yes| PASSENGER[Enter Passenger Details]
    AUTH --> PASSENGER
    
    PASSENGER --> EXTRAS[Select Add-ons]
    EXTRAS --> PAYMENT[Payment Page]
    PAYMENT --> PROCESS[Process Payment]
    PROCESS --> SUCCESS{Payment Success?}
    
    SUCCESS -->|Yes| CONFIRMATION[Booking Confirmation]
    SUCCESS -->|No| ERROR[Payment Error]
    ERROR --> PAYMENT
    
    CONFIRMATION --> EMAIL[Send Confirmation Email]
    EMAIL --> DOCUMENTS[Generate E-tickets]
    DOCUMENTS --> END([Journey Complete])
    
    %% Styling
    classDef startEnd fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef decision fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef error fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    
    class START,END startEnd
    class RESULTS,FILTER,SELECT,DETAILS,PASSENGER,EXTRAS,PAYMENT,PROCESS,CONFIRMATION,EMAIL,DOCUMENTS process
    class SEARCH,BOOK,LOGIN,SUCCESS decision
    class ERROR error
```

## 🏨 Hotel Booking Journey

```mermaid
flowchart TD
    START([User Visits Hotels Page]) --> SEARCH_FORM[Fill Search Form]
    SEARCH_FORM --> SEARCH[Search Hotels]
    SEARCH --> RESULTS[View Hotel Results]
    RESULTS --> SORT[Sort & Filter]
    SORT --> SELECT[Select Hotel]
    SELECT --> HOTEL_DETAILS[View Hotel Details]
    HOTEL_DETAILS --> ROOMS[Browse Rooms]
    ROOMS --> ROOM_SELECT[Select Room]
    ROOM_SELECT --> AVAILABILITY[Check Availability]
    
    AVAILABILITY --> AVAILABLE{Available?}
    AVAILABLE -->|No| ALTERNATIVE[Show Alternatives]
    AVAILABLE -->|Yes| BOOK[Proceed to Book]
    ALTERNATIVE --> SELECT
    
    BOOK --> AUTH_CHECK{Logged In?}
    AUTH_CHECK -->|No| LOGIN[Login/Register]
    AUTH_CHECK -->|Yes| GUEST_INFO[Enter Guest Information]
    LOGIN --> GUEST_INFO
    
    GUEST_INFO --> SPECIAL_REQUESTS[Special Requests]
    SPECIAL_REQUESTS --> REVIEW[Review Booking]
    REVIEW --> PAYMENT[Payment]
    PAYMENT --> PROCESS[Process Payment]
    
    PROCESS --> SUCCESS{Success?}
    SUCCESS -->|No| PAYMENT_ERROR[Payment Failed]
    SUCCESS -->|Yes| CONFIRMATION[Booking Confirmed]
    PAYMENT_ERROR --> PAYMENT
    
    CONFIRMATION --> VOUCHER[Generate Voucher]
    VOUCHER --> EMAIL[Send Confirmation]
    EMAIL --> CALENDAR[Add to Calendar]
    CALENDAR --> END([Booking Complete])
    
    %% Styling
    classDef startEnd fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef decision fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef error fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    
    class START,END startEnd
    class SEARCH_FORM,SEARCH,RESULTS,SORT,SELECT,HOTEL_DETAILS,ROOMS,ROOM_SELECT,AVAILABILITY,ALTERNATIVE,BOOK,GUEST_INFO,SPECIAL_REQUESTS,REVIEW,PAYMENT,PROCESS,CONFIRMATION,VOUCHER,EMAIL,CALENDAR process
    class AVAILABLE,AUTH_CHECK,SUCCESS decision
    class PAYMENT_ERROR error
```

## 🤖 AI Itinerary Generation Journey

```mermaid
flowchart TD
    START([User Wants AI Itinerary]) --> PROMPT[Describe Dream Trip]
    PROMPT --> PREFERENCES[Set Preferences]
    PREFERENCES --> BUDGET[Set Budget Range]
    BUDGET --> TRAVELERS[Number of Travelers]
    TRAVELERS --> DURATION[Trip Duration]
    DURATION --> INTERESTS[Select Interests]
    INTERESTS --> SUBMIT[Submit to AI]
    
    SUBMIT --> AI_PROCESS[AI Processing]
    AI_PROCESS --> GENERATE[Generate Itinerary]
    GENERATE --> REVIEW_AI[Review AI Output]
    REVIEW_AI --> SATISFIED{Satisfied?}
    
    SATISFIED -->|No| REFINE[Refine Request]
    SATISFIED -->|Yes| CUSTOMIZE[Customize Details]
    REFINE --> AI_PROCESS
    
    CUSTOMIZE --> ADD_ACTIVITIES[Add/Remove Activities]
    ADD_ACTIVITIES --> ADJUST_BUDGET[Adjust Budget]
    ADJUST_BUDGET --> SAVE_ITINERARY[Save Itinerary]
    
    SAVE_ITINERARY --> SHARE_OPTIONS{Share Itinerary?}
    SHARE_OPTIONS -->|Yes| SHARE[Share with Friends]
    SHARE_OPTIONS -->|No| BOOK_OPTIONS{Book Now?}
    SHARE --> BOOK_OPTIONS
    
    BOOK_OPTIONS -->|Yes| BOOKING_FLOW[Start Booking Process]
    BOOK_OPTIONS -->|No| SAVE_FOR_LATER[Save for Later]
    
    BOOKING_FLOW --> BOOK_FLIGHTS[Book Flights]
    BOOK_FLIGHTS --> BOOK_HOTELS[Book Hotels]
    BOOK_HOTELS --> BOOK_ACTIVITIES[Book Activities]
    BOOK_ACTIVITIES --> COMPLETE_BOOKING[Complete Booking]
    
    SAVE_FOR_LATER --> END([Itinerary Saved])
    COMPLETE_BOOKING --> END
    
    %% Styling
    classDef startEnd fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef ai fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef decision fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    classDef booking fill:#00BCD4,stroke:#0097A7,stroke-width:2px,color:#fff
    
    class START,END startEnd
    class PROMPT,PREFERENCES,BUDGET,TRAVELERS,DURATION,INTERESTS,SUBMIT,CUSTOMIZE,ADD_ACTIVITIES,ADJUST_BUDGET,SAVE_ITINERARY,SHARE,SAVE_FOR_LATER process
    class AI_PROCESS,GENERATE,REVIEW_AI ai
    class SATISFIED,SHARE_OPTIONS,BOOK_OPTIONS decision
    class BOOKING_FLOW,BOOK_FLIGHTS,BOOK_HOTELS,BOOK_ACTIVITIES,COMPLETE_BOOKING booking
```

## 👤 User Registration & Onboarding

```mermaid
flowchart TD
    START([New User Arrives]) --> LANDING[View Landing Page]
    LANDING --> CTA{Click Sign Up?}
    CTA -->|No| BROWSE[Browse as Guest]
    CTA -->|Yes| SIGNUP_FORM[Sign Up Form]
    
    BROWSE --> GUEST_LIMIT[Limited Features]
    GUEST_LIMIT --> CONVERT[Encourage Sign Up]
    CONVERT --> SIGNUP_FORM
    
    SIGNUP_FORM --> VALIDATION[Validate Form]
    VALIDATION --> VALID{Valid Data?}
    VALID -->|No| ERRORS[Show Errors]
    VALID -->|Yes| CREATE_ACCOUNT[Create Account]
    ERRORS --> SIGNUP_FORM
    
    CREATE_ACCOUNT --> EMAIL_VERIFY[Send Verification Email]
    EMAIL_VERIFY --> VERIFY_WAIT[Wait for Verification]
    VERIFY_WAIT --> VERIFIED{Email Verified?}
    VERIFIED -->|No| RESEND[Resend Email Option]
    VERIFIED -->|Yes| WELCOME[Welcome Screen]
    RESEND --> EMAIL_VERIFY
    
    WELCOME --> ONBOARDING[Start Onboarding]
    ONBOARDING --> PROFILE[Complete Profile]
    PROFILE --> PREFERENCES[Set Travel Preferences]
    PREFERENCES --> INTERESTS[Select Interests]
    INTERESTS --> NOTIFICATIONS[Notification Settings]
    NOTIFICATIONS --> TUTORIAL[Quick Tutorial]
    TUTORIAL --> FIRST_SEARCH[Encourage First Search]
    FIRST_SEARCH --> END([Onboarding Complete])
    
    %% Styling
    classDef startEnd fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef decision fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef onboarding fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    classDef error fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    
    class START,END startEnd
    class LANDING,BROWSE,GUEST_LIMIT,CONVERT,SIGNUP_FORM,VALIDATION,CREATE_ACCOUNT,EMAIL_VERIFY,VERIFY_WAIT,RESEND process
    class CTA,VALID,VERIFIED decision
    class WELCOME,ONBOARDING,PROFILE,PREFERENCES,INTERESTS,NOTIFICATIONS,TUTORIAL,FIRST_SEARCH onboarding
    class ERRORS error
```

## 📱 Mobile App User Flow

```mermaid
flowchart TD
    INSTALL([App Installed]) --> SPLASH[Splash Screen]
    SPLASH --> PERMISSIONS[Request Permissions]
    PERMISSIONS --> LOCATION{Location Access?}
    LOCATION -->|Granted| ONBOARDING[Onboarding Slides]
    LOCATION -->|Denied| LIMITED[Limited Features Warning]
    LIMITED --> ONBOARDING
    
    ONBOARDING --> AUTH_CHOICE[Login or Sign Up]
    AUTH_CHOICE --> EXISTING{Existing User?}
    EXISTING -->|Yes| LOGIN[Login]
    EXISTING -->|No| REGISTER[Register]
    
    LOGIN --> BIOMETRIC{Biometric Available?}
    BIOMETRIC -->|Yes| SETUP_BIO[Setup Biometric]
    BIOMETRIC -->|No| HOME[Home Screen]
    SETUP_BIO --> HOME
    
    REGISTER --> VERIFY_MOBILE[Verify Mobile]
    VERIFY_MOBILE --> PROFILE_SETUP[Profile Setup]
    PROFILE_SETUP --> HOME
    
    HOME --> MAIN_FEATURES[Main Features]
    MAIN_FEATURES --> SEARCH[Search Travel]
    MAIN_FEATURES --> AI_CHAT[AI Chat]
    MAIN_FEATURES --> BOOKINGS[My Bookings]
    MAIN_FEATURES --> PROFILE[Profile]
    
    SEARCH --> RESULTS[Search Results]
    RESULTS --> DETAILS[View Details]
    DETAILS --> BOOK[Book]
    BOOK --> PAYMENT[Mobile Payment]
    PAYMENT --> CONFIRMATION[Booking Confirmed]
    
    AI_CHAT --> VOICE{Voice Input?}
    VOICE -->|Yes| VOICE_PROCESS[Process Voice]
    VOICE -->|No| TEXT_INPUT[Text Input]
    VOICE_PROCESS --> AI_RESPONSE[AI Response]
    TEXT_INPUT --> AI_RESPONSE
    AI_RESPONSE --> ITINERARY[Generated Itinerary]
    
    BOOKINGS --> TRIP_LIST[Trip List]
    TRIP_LIST --> TRIP_DETAILS[Trip Details]
    TRIP_DETAILS --> CHECKIN[Mobile Check-in]
    TRIP_DETAILS --> SUPPORT[Contact Support]
    
    PROFILE --> SETTINGS[Settings]
    SETTINGS --> NOTIFICATIONS[Push Notifications]
    SETTINGS --> SYNC[Cloud Sync]
    SETTINGS --> LOGOUT[Logout]
    
    %% Styling
    classDef startEnd fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef process fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef decision fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    classDef mobile fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    classDef ai fill:#00BCD4,stroke:#0097A7,stroke-width:2px,color:#fff
    
    class INSTALL,CONFIRMATION startEnd
    class SPLASH,PERMISSIONS,LIMITED,ONBOARDING,AUTH_CHOICE,LOGIN,REGISTER,VERIFY_MOBILE,PROFILE_SETUP,HOME,MAIN_FEATURES,SEARCH,RESULTS,DETAILS,BOOK,PAYMENT,BOOKINGS,TRIP_LIST,TRIP_DETAILS,PROFILE,SETTINGS,NOTIFICATIONS,SYNC,LOGOUT process
    class LOCATION,EXISTING,BIOMETRIC,VOICE decision
    class SETUP_BIO,CHECKIN,SUPPORT mobile
    class AI_CHAT,VOICE_PROCESS,TEXT_INPUT,AI_RESPONSE,ITINERARY ai
```

## 🎯 Conversion Funnel

```mermaid
funnel
    title Conversion Funnel
    "Website Visitors" : 100000
    "Sign Up Started" : 15000
    "Account Created" : 12000
    "Email Verified" : 10000
    "Profile Completed" : 8500
    "First Search" : 7000
    "Viewed Results" : 6500
    "Started Booking" : 3500
    "Completed Payment" : 2800
    "Repeat Customers" : 1400
```

## 📊 User Engagement Flow

```mermaid
gitgraph
    commit id: "User Registration"
    branch onboarding
    checkout onboarding
    commit id: "Profile Setup"
    commit id: "Preferences Set"
    commit id: "First Search"
    checkout main
    merge onboarding
    commit id: "Regular Usage"
    branch booking
    checkout booking
    commit id: "First Booking"
    commit id: "Trip Completed"
    commit id: "Review Left"
    checkout main
    merge booking
    commit id: "Loyalty Member"
    branch advanced
    checkout advanced
    commit id: "AI Features Used"
    commit id: "Multiple Bookings"
    commit id: "Referral Made"
    checkout main
    merge advanced
    commit id: "Power User"
```