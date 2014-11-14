This app includes the beginnings of a phantomjs controller 
that can spawn swarms of phantomjs instances/tabs and 
execute a sequence of tests against connected Meteor clients.

This code lives in the `/packages/useful:loadtest` folder.

An example of how to use this code is located in the 
`server/app.js` file and explains the entire current
feature set.

It can and will spin up a set of phantomjs windows,
connect to the specified server and execute and time
commands you give it.

---

To run on modulus.

#1 - Use demeteorizer to create a modulus-compatible 
project package.

`npm install -g modulus demeteorizer`

from the project directory:
`demeteorizer`

#2 - slightly modify the `.demeteorized` directory's
`package.json` to use a sunos compatible phantomjs build.

Replace the existing phantomjs line in the `.demeteorized/package.json`
with the following:

`"phantomjs-sun": "https://registry.npmjs.org/phantomjs-sun/-/phantomjs-sun-1.9.1-1.tgz",`

#3 - `modulus deploy` from the `.demeteorized` directory as you would a normal project.

---

TODO

* After testing the real world usefulness of the package, split the package out into a repo.
* Then flesh out this controller application to be able to record, list, reply/etc load test swarms and tests and display graphs of the generated data.
* Ability to specify a different number of clients not in blocks of 50.
* Real documentation.
* Automated modulus deploy script to replace the manual process above (or re-work so the process is no longer necessary).