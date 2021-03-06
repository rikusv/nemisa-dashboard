[![codecov](https://codecov.io/gh/adieyal/k4i_dashboard/branch/master/graph/badge.svg)](https://codecov.io/gh/adieyal/k4i_dashboard/)
[![Build Status](https://travis-ci.org/adieyal/k4i_dashboard.png)](https://travis-ci.org/adieyal/k4i_dashboard)

K4I Dashboard
===============================

## TODO

- [ ] Discuss which parts of the template this README.md was copied from are still relevant, and update accordingly.
- [ ] Document deployment (`git remote add dokku dokku@hetzner1.openup.org.za:k4i.` ... `git push dokku master`)
- [ ] Document running DB migration scripts as needed (`ansible hetzner1.openup.org.za -a 'dokku run k4i python manage.py migrate'`)
- [x] survey year dropdown
- [x] submit form button is strange
- [x] industry form: selected filters not working
- [ ] industry form: check why bottom chart different to https://k4i.openup.org.za/dashboard/

Complete project setup
----------------------

- [ ] Initialise a git repository in this directory
  - [ ] Explicitly add directories needed for collectstatic to work: `git add -f staticfiles/.gitkeep k4i_dashboard/static/.gitkeep`
- [ ] Create a repository on [GitHub](https://github.com/OpenUpSA) and add as a remote to this repository
  - e.g. `git remote add origin git@github.com:OpenUpSA/k4i_dashboard.git`
- [ ] Enable Continuous Integration checks for the GitHub Repository at [travis-ci.org](https://travis-ci.org)
  - [ ] Enable periodic builds, e.g. weekly, to detect when dependency changes break your builds before they hurt you.
- [ ] Enable code coverage reporting for the project at [codecov.io](https://codecov.io)
  - [ ] Enable GitHub integration - it automatically configures Travis-CI and shows coverage diffs in pull requests
  - [ ] Verify that you see coverage % on the Commits tab for the project. If it's just zero, check for errors by clicking a commit item.
- [ ] Clean up this checklist - your project is set up now and you don't need it any more.


Project Layout
--------------

### Docker

This directory is mapped as a volume in the app. This can result in file permission errors like `EACCES: permission denied`. File permissions are generally based on UID integers and not usernames, so it doesn't matter what users are called, UIDs have to match or be mapped to the same numbers between the host and container.

We want to avoid running as root in production (even inside a container) and we want production to be as similar as possible to dev and test.

The easiest solution is to make this directory world-writable so that the container user can write to install/update stuff. Be aware of the security implications of this. e.g.

    sudo find . -type d -exec chmod 777 '{}' \;
    sudo find . -type f -exec chmod 774 '{}' \;

Another good option is to specify the user ID to run as in the container. A persistent way to do that is by specifying `user: ${UID}:${GID}` in a `docker-compose.yml` file, perhaps used as an overlay, and specifying your host user's IDs in an environment file used by docker-compose, e.g. `.env`.


### Django

Apps go in the project directory `k4i_dashboard`


### Python

Dependencies are managed via Pipfile in the docker container.

Add and lock dependencies in a temporary container:

    docker-compose run --rm web pipenv install pkgname==1.2.3

Rebuild the image to contain the new dependencies:

    docker-compose build web

Make sure to commit updates to Pipfile and Pipfile.lock to git


### Javascript and CSS

JS and CSS are bundled using [parcel](https://parceljs.org/) - see `package.json`.

Dependencies are managed via `yarn`, e.g.

    docker-compose run --rm web yarn add bootstrap@4.x

Make sure to commit updates to package.json and yarn.lock to git.


Development setup
-----------------

In one shell, run the frontend asset builder

    docker-compose run --rm web yarn dev


In another shell, initialise and run the django app

    docker-compose run --rm web bin/wait-for-postgres.sh
    docker-compose run --rm web python manage.py migrate
    docker-compose up


If you need to destroy and recreate your dev setup, e.g. if you've messed up your
database data or want to switch to a branch with an incompatible database schema,
you can destroy all volumes and recreate them by running the following, and running
the above again:

    docker-compose down --volumes


Running tests
-------------

    docker-compose run --rm web python manage.py test

Tests might fail to connect to the databse if the docker-compose `db` service wasn't running and configured yet. Just check the logs for the `db` service and run the tests again.


Settings
--------

Undefined settings result in exceptions at startup to let you know they are not configured properly. It's one this way so that the defaults don't accidentally let bad things happen like forgetting analytics or connecting to the prod DB in development.


| Key | Default | Type | Description |
|-----|---------|------|-------------|
| `DATABASE_URL` | undefined | String | `postgresql://user:password@hostname/dbname` style URL |
| `DJANGO_DEBUG_TOOLBAR` | False | Boolean | Set to `True` to enable the Django Debug toolbar NOT ON A PUBLIC SERVER! |
| `DJANGO_SECRET_KEY` | undefined | String | Set this to something secret and unguessable in production. The security of your cookies and other crypto stuff in django depends on it. |
| `TAG_MANAGER_CONTAINER_ID` | undefined | String | [Google Tag Manager](tagmanager.google.com) Container ID. [Use this to set up Google Analytics.](https://support.google.com/tagmanager/answer/6107124?hl=en). Requried unless `TAG_MANAGER_ENABLED` is set to `False` |
| `TAG_MANAGER_ENABLED` | `True` | Boolean | Use this to disable the Tag Manager snippets, e.g. in dev or sandbox. |
