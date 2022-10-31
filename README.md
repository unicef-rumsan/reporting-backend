# Rahat Reporting Backend

First install PostgreSQL and create a database named `**from local.json => db.database**` with a user named `**from local.json => db.username**` with password `**from local.json => db.password**` and give it all privileges on the database.

- Install pgAdmin 4 and create a server with the same credentials as above.

**Run the following script to setup automatically**

```bash
$ yarn setup:app
```

**Or run the following commands manually in order**

#### 1. Add all the required files inside "config" folder in the root directory of the project.

- `local.json` file contains the database credentials and configs.
- `mail.json` file contains the mail config.
- `setupDB.js` file contains the script for setting up the DB.

#### 2. Installation of the required packages

```bash
$ yarn
```

#### 3. Setup DB Models

```bash
$ yarn db:setup
```

#### 4. Import Beneficiaries, Vendors and Projects from Rahat Backend

```bash
$ yarn data:import
```

#### 5. Fetch all the missing Transactions and update the missing values from explorer

```bash
$ yarn transaction:import
```

#### 4. Run the project

```bash
$ yarn start
```
