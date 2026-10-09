# Gator 🐊

Gator is a command-line RSS feed aggregator built with TypeScript, Node.js, PostgreSQL, and Drizzle ORM.

It allows users to register accounts, add RSS feeds, follow feeds created by other users, and manage their subscriptions directly from the terminal.

## Requirements

Before running Gator, install:

- **Node.js** and npm
- **PostgreSQL** with a running database server
- **Git** to clone the repository

Gator uses Drizzle ORM to manage its PostgreSQL database.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create a PostgreSQL database named `gator`.

For example, using PostgreSQL's command-line client:

```sql
CREATE DATABASE gator;
```

Make sure your PostgreSQL server is running and you have a database user with permission to access the database.

### 4. Configure Gator

Create a file named `.gatorconfig.json` in your home directory.

For example, on Linux or WSL:

```bash
nano ~/.gatorconfig.json
```

Add your PostgreSQL connection information:

```json
{
  "db_url": "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator",
  "current_user_name": ""
}
```

Replace `YOUR_PASSWORD` with your PostgreSQL password and update the database username, host, port, or database name if they differ.

The `db_url` connects Gator to PostgreSQL, while `current_user_name` stores the currently selected Gator user.

Keep your database credentials private.

### 5. Run database migrations

```bash
npx drizzle-kit migrate
```

This creates the database tables needed to store users, RSS feeds, and feed subscriptions.

## Running Gator

From the project directory, run:

```bash
npm run start <command> [arguments]
```

For example:

```bash
npm run start register chris
```

## Available Commands

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `register <name>`      | Create a new user and log in                   |
| `login <name>`         | Switch to an existing user                     |
| `users`                | List registered users                          |
| `addfeed <name> <url>` | Add a new RSS feed and automatically follow it |
| `feeds`                | List all available feeds and their creators    |
| `follow <url>`         | Follow an existing feed                        |
| `following`            | List feeds followed by the current user        |
| `unfollow <url>`       | Stop following a feed                          |
| `reset`                | Delete all users and associated data           |

**Warning:** The `reset` command deletes stored user data and associated feeds and subscriptions. Use it carefully.

## Example Usage

Register a new user:

```bash
npm run start register chris
```

Add an RSS feed:

```bash
npm run start addfeed "Hacker News RSS" "https://hnrss.org/newest"
```

List all feeds:

```bash
npm run start feeds
```

Register another user:

```bash
npm run start register alex
```

Follow the existing Hacker News feed:

```bash
npm run start follow "https://hnrss.org/newest"
```

Show followed feeds:

```bash
npm run start following
```

Unfollow a feed:

```bash
npm run start unfollow "https://hnrss.org/newest"
```

Switch back to another user:

```bash
npm run start login chris
```

## Technologies Used

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- RSS and XML parsing
- Git and GitHub

## Database Structure

Gator uses three main tables:

- `users` — stores registered users.
- `feeds` — stores RSS feed information and the user who created each feed.
- `feed_follows` — connects users to feeds using a many-to-many relationship.

A user can follow multiple feeds, and a feed can have multiple followers.

## Development

Check the TypeScript code for errors:

```bash
npx tsc --noEmit
```

Generate a database migration after changing the schema:

```bash
npx drizzle-kit generate
```

Apply migrations:

```bash
npx drizzle-kit migrate
```

## Author

Developed as part of the Boot.dev backend development curriculum.
