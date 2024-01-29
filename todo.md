### CHAT
- [x] **Channel Creation Feature** :
User should be able to create channels (chat rooms) that can be either public,
or private, or protected by a password.

- [x] **Direct Messaging Capability**
<br>_Enable users to send direct messages to other users on the platform._

- [x] **User Blocking Functionality**
  : Implement a feature for users to block other users, preventing them from seeing messages from the blocked account.

- [x] **Channel Ownership and Management**
    - Automatically designate the creator of a new channel as the owner.
    - Allow the `channel owner` to set, change, or remove a password for channel access.
    - Enable the `channel owner` to assign other users as channel administrators.
    - Permit `channel administrators` to kick, ban, or temporarily mute users, except for channel owners.

- [ ] **Game Invitation System**
  : Implement a feature for users to invite others to play Pong via the chat interface.

- [x] **Profile Access Through Chat**
  : Enable users to view other players' profiles directly through the chat interface.


### USER
- [x] **OAuth Login** Users must log in using the OAuth system of the 42 intranet.

- [x] **Unique Usernames** Users should be able to choose a unique name that will be displayed on the website.

- [x] **Avatar Upload** Users should be able to upload an avatar. A default avatar must be set if the user does not upload one.

- [ ] **Two-Factor Authentication** Users should be able to enable two-factor authentication, for example, using Google Authenticator or text messages to their phone.

- [ ] **Friend System** Users should be able to add other users as friends and view their current status (online, offline, in a game, etc.).

- [x] **User Stats Display** Display stUser profiles need to display stats like wins, losses, ladder level, achievements, etc.atistics on user profiles (wins, losses, ladder level, achievements, etc.).

- [ ] **Match History Feature** Each user should have a Match History, including details of 1v1 games, ladder rankings, and other relevant information. This should be accessible to all logged-in users​​.


### GAME
- [ ] **Implement Live Pong Game**
  - Enable users to play a live Pong game against another player directly on the website.

- [ ] **Develop Matchmaking System**
  - Implement a system where users can join a queue and be automatically matched with another player.

- [ ] **Game Design Options**
  - Create the Pong game, which can be either a canvas game or a 3D rendered game.
  - Ensure the game design remains faithful to the original Pong (1972), regardless of aesthetics.

- [ ] **Customization Features**
  - Offer customization options such as power-ups or different maps.
  - Include an option for users to select a default version of the game without extra features.

- [ ] **Responsive Game Design**
  - Ensure the game is responsive and playable on various devices and screen sizes.


### SECURITY
- [ ] **Password Hashing**
  - Ensure all passwords stored in the database are hashed.

- [ ] **SQL Injection Protection**
  - Implement measures to protect the website against SQL injections.

- [ ] **Server-Side Validation**
  - Perform server-side validation for all forms and user inputs.

- [ ] **Strong Password Hashing Algorithm**
  - Use a strong password hashing algorithm for enhanced security.

- [ ] **Secure Storage of Credentials**
  - Store all credentials, API keys, and environment variables in a local `.env` file.
  - Ensure this `.env` file is ignored by git to prevent public access.
