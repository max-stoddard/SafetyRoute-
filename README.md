# SafetyRoute

**Our Background:**

- We as students have all had moments where we have felt unsafe whilst living in London
- Many Londoners, particularly women and vulnerable individuals, feel unsafe walking home after dark.
- We personally have been harassed and been victims to theft whilst living in London

**The Problem in statistics:**

- 81% of women report feeling unsafe walking home in the dark
- 71% of people say more needs to be done to improve street safety
- 69% We as students have all had moments where we have felt unsafe whilst living in London

**Our idea:**

- Incorporate crime-data into walking directions
- Prioritise walking routes based on safety
- Make walking as accessible as possible

**Our Solution:**

- Take in crime data from the UK Police Crime archive
- Store and access our own Database with crime data linked to locations
- Find the safest route based on crime data that is still viable

**Building and challenges:**

- Getting crime data from data.police.uk into a database was an important consideration
- This was mitigated via using InterSystems IRIS Data Platform
- InterSystems IRIS vector search allows us to gain further insights into the severity of specific crime data, based on keywords
- Our “crime context” is fully vectorized to allow for crime severity to be quantified from context from 0 to 1, for any crime.
- Our model is trained using data obtained from vector dot product searching
- This allows us to further avoid routes where crimes are particularly dangerous

**Our path safety ranking algorithm**

- We generated multiple routes from start to endpoint, divided into coordinate pair "segments", via Google Directions API
- We then find crimes that have occurred, within the last 3 months, along each segment of the route
- We then compute a severity score of each crime, using our trained model, to generate a total risk score for each route and choose the safest route

**Routes for future development**

- Worldwide Crime Data Coverage & pathfinding
- Street Lighting Data integration: Prioritise lighter more visible routes
- User-based Incident Reporting – Allow users to report unsafe areas
or real-time incidents.

