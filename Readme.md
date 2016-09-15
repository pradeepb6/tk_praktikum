TK Praktikum
================

----

#### Getting started

0. Clone this repo:
    ```
    git clone ssh://git@scm.informatik.tu-darmstadt.de/iptk-ss2016/iptk-ss2016-team-mike.git
    ```
   
0. Install NodeJS, mongodb, grunt (globally) and bower (globally)

0. Installs the required npm packages
    ```sh
    npm install
    ```
0. Installs the required bower components
    ```sh
    bower install
    ```

0. Configuration file:
    ```sh
    mv config_template.js config.js
    ```
0. To create roles and dummy user please do the following steps:
    comment the **createDummyUsers();** and uncomment **createRoles();**
    ````
    nodejs initdb.js
    ````
    
0. Now comment the line **createRoles();** and uncomment **createDummyUsers();** and run
    ````
    nodejs initdb.js
    ````

0. Start Node server:
    ```sh
    npm start
    ```

0. Goto to your browser and access the app using localhost:3000 <br />
You should be able to see *'Conference Management Systems'* on your browser.

0. Credentials for 'chair' are 
    ````
    username: chair@test.com
    password: 12345
    ````

0. Credentials for 'author' are 
    ````
    username: test0@test.com to test9@test.com 
    password: 12345
    ````
    
0. Credentials for 'chair' are 
    ````
    username: test11@test.com to test20@test.com
    password: 12345
    ````
