# Gator 🐊

Gator is a command-line RSS feed aggregator built with TypeScript, Node.js, PostgreSQL, and Drizzle ORM.

It allows users to register, add RSS feeds, follow feeds created by other users, and manage their subscriptions.

## Requirements

Before running Gator, install:

- Node.js and npm
- PostgreSQL
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Christian-Shatleh/gator.git
cd gator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create a PostgreSQL database named `gator`.

```sql
CREATE DATABASE gator;
```

Make sure your PostgreSQL server is running.

### 4. Configure Gator

Create a `.gatorconfig.json` file in your home directory.

For Linux or WSL:

```bash
nano ~/.gatorconfig.json
```

Add:

```json
{
  "db_url": "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator",
  "current_user_name": ""
}
```

Replace the password and database connection details with your own.

### 5. Run migrations

```bash
npx drizzle-kit migrate
```

## Running Gator

Use:

```bash
npm run start <command> [arguments]
```

## Commands

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `register <name>`      | Register a user                            |
| `login <name>`         | Log in as an existing user                 |
| `users`                | List registered users                      |
| `addfeed <name> <url>` | Add a new feed and follow it               |
| `feeds`                | List available feeds                       |
| `follow <url>`         | Follow an existing feed                    |
| `following`            | List feeds you're following                |
| `unfollow <url>`       | Unfollow a feed                            |
| `reset`                | Delete all users and their associated data |

## Example Usage

Register:

```bash
npm run start register chris
```

Add a feed:

```bash
npm run start addfeed "Hacker News RSS" "https://hnrss.org/newest"
```

List feeds:

```bash
npm run start feeds
```

Follow a feed:

```bash
npm run start follow "https://hnrss.org/newest"
```

List your followed feeds:

```bash
npm run start following
```

Unfollow a feed:

```bash
npm run start unfollow "https://hnrss.org/newest"
```

## Technologies

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM

## Author

Christian Shatleh

Developed as part of the Boot.dev backend development curriculum.
