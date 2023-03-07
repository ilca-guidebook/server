# server

## Setup

...

### Initial Data seed

run:

> ./devScripts/data_seed.sh

## running scripts on the server

For performing or adding tasks such as data migrations we have a devel.js file in the devSCripts.
to run a specific task either connect to the running docker container or run:

> devScripts/run_dev_script.sh <command>

For example:

> devScripts/run_dev_script.sh health
