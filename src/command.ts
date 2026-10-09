
import { readConfig, setUser } from "./config.js";

import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./lib/db/queries/users.js";

import { fetchFeed } from "./rss.js";

import {
  createFeed,
  getFeeds,
  getFeedByURL,
  createFeedFollow,
  getFeedFollowsForUser,
  deleteFeedFollow,
  getNextFeedToFetch,
  markFeedFetched,
} from "./lib/db/queries/feeds.js";

import {
  createPost,
  getPostsForUser,
} from "./lib/db/queries/posts.js";

import type { Feed, User } from "./lib/db/schema.js";

// TYPES

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = {
  [cmdName: string]: CommandHandler;
};

// REGISTER COMMAND

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

// RUN COMMAND

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}

// MIDDLEWARE

export function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (cmdName, ...args) => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No user is currently logged in");
    }

    const user = await getUserByName(
      config.currentUserName
    );

    if (!user) {
      throw new Error(
        `User ${config.currentUserName} not found`
      );
    }

    await handler(cmdName, user, ...args);
  };
}

// LOGIN

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }

  const username = args[0];

  const user = await getUserByName(username);

  if (!user) {
    throw new Error(`user ${username} does not exist`);
  }

  setUser(username);

  console.log(`User set to ${username}`);
}

// REGISTER

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }

  const name = args[0];

  const existingUser = await getUserByName(name);

  if (existingUser) {
    throw new Error(`user ${name} already exists`);
  }

  const user = await createUser(name);

  setUser(name);

  console.log(`User ${name} created`);
  console.log(user);
}

// RESET

export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();

  console.log("Database reset successfully");
}

// USERS

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allUsers = await getUsers();
  const config = readConfig();

  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

// AGG

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    throw new Error("Usage: agg <time_between_reqs>");
  }

  const timeBetweenRequests = parseDuration(args[0]);

  console.log(`Collecting feeds every ${args[0]}`);

  const handleError = (error: unknown) => {
    console.error("Error scraping feeds:", error);
  };

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.once("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error(
      "Invalid duration. Use a number followed by ms, s, m, or h"
    );
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  const millisecondsByUnit: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
  };

  return value * millisecondsByUnit[unit];
}

export async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds to fetch");
    return;
  }

  console.log(`Fetching ${feed.name} from ${feed.url}`);

  const fetchedFeed = await fetchFeed(feed.url);
  await markFeedFetched(feed.id);

  for (const item of fetchedFeed.channel.item) {
    await createPost(
      item.title,
      item.link,
      item.description ?? null,
      parsePublishedAt(item.pubDate),
      feed.id
    );
  }
}

export function parsePublishedAt(
  publishedAt: string | undefined
): Date | null {
  if (!publishedAt) {
    return null;
  }

  const timestamp = Date.parse(publishedAt);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

// BROWSE

export const handlerBrowse: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  if (args.length > 1) {
    throw new Error("Usage: browse [limit]");
  }

  const limit = args[0] === undefined ? 2 : Number(args[0]);

  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new Error("limit must be a positive integer");
  }

  const posts = await getPostsForUser(user.id, limit);

  for (const post of posts) {
    console.log(post.title);
    console.log(post.url);

    if (post.publishedAt) {
      console.log(`Published: ${post.publishedAt.toISOString()}`);
    }

    if (post.description) {
      console.log(post.description);
    }

    console.log();
  }
};

// PRINT FEED

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ID: ${feed.id}`);
  console.log(`Created At: ${feed.createdAt}`);
  console.log(`Updated At: ${feed.updatedAt}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

// ADDFEED

export const handlerAddFeed: UserCommandHandler =
  async (cmdName, user, ...args) => {
    if (args.length < 2) {
      throw new Error("name and url are required");
    }

    const name = args[0];
    const url = args[1];

    const feed = await createFeed(name, url, user.id);

    printFeed(feed, user);

    const follow = await createFeedFollow(
      user.id,
      feed.id
    );

    console.log(
      `${follow.userName} is now following ${follow.feedName}`
    );
  };

// FEEDS

export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allFeeds = await getFeeds();

  for (const feed of allFeeds) {
    console.log(`Name: ${feed.feedName}`);
    console.log(`URL: ${feed.feedUrl}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  }
}

// FOLLOW

export const handlerFollow: UserCommandHandler =
  async (cmdName, user, ...args) => {
    if (args.length !== 1) {
      throw new Error("Usage: follow <url>");
    }

    const url = args[0];

    const feed = await getFeedByURL(url);

    if (!feed) {
      throw new Error("Feed not found");
    }

    const follow = await createFeedFollow(
      user.id,
      feed.id
    );

    console.log(
      `${follow.userName} is now following ${follow.feedName}`
    );
  };

// FOLLOWING

export const handlerFollowing: UserCommandHandler =
  async (cmdName, user, ...args) => {
    if (args.length !== 0) {
      throw new Error("Usage: following");
    }

    const follows = await getFeedFollowsForUser(
      user.id
    );

    for (const follow of follows) {
      console.log(follow.feedName);
    }
  };
export const handlerUnfollow: UserCommandHandler =
  async (cmdName, user, ...args) => {
    if (args.length !== 1) {
      throw new Error("Usage: unfollow <url>");
    }

    const url = args[0];

    const deletedFollow = await deleteFeedFollow(
      user.id,
      url
    );

    if (!deletedFollow) {
      throw new Error(
        "You are not following this feed"
      );
    }

    console.log(`Successfully unfollowed ${url}`);
  };
