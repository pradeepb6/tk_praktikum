// conf_user collection
db.createCollection("conf_user");

db.conf_user.insert({'salutation': 'Mr',
    'firstname': 'Amar',
    'lastname': 'Anthony',
    'email': 'test@test.com',
    'password': '12345',
    'country': 'Germany',
    'state': 'Hesse',
    'city': 'Darmstadt',
    'address_line': 'Dolivostrasse 12, 64287',
    'institution': 'D_DA',
    'registered_on':'2014-01-22T14:56:59.301Z',
    'last_login': '2014-01-22T14:56:59.301Z',
    'roles': ['author', 'reviewer'],
    'created_by': 'user'
});



db.createCollection("conf_roles");

db.conf_roles.insert({
    role:'author'
});
db.conf_roles.insert({
    role:'reviewer'
});
db.conf_roles.insert({
    role:'chair'
});



db.createCollection("conf_role_users");

db.conf_role_users.insert({
    role_id: '575c19b6ffca4eeb27a5ea5b',
    user_id: '5759a8c69fbb5c77063187e6'
});
db.conf_role_users.insert({
    role_id: '575c19c8ffca4eeb27a5ea5d',
    user_id: '5759a8c69fbb5c77063187e6'
});