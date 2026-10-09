import { and, eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { feeds, users, feedFollows } from "../schema.js";

export async function createFeed(
  name: string,
  url: string,
  userId: string
) {
  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return result;
}

export async function getFeeds() {
  return await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

export async function getFeedByURL(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

export async function markFeedFetched(feedId: string) {
  const now = new Date();

  const [feed] = await db
    .update(feeds)
    .set({
      lastFetchedAt: now,
      updatedAt: now,
    })
    .where(eq(feeds.id, feedId))
    .returning();

  return feed;
}

export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed;
}

export async function createFeedFollow(
  userId: string,
  feedId: string
) {
  const [newFollow] = await db
    .insert(feedFollows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(
      users,
      eq(feedFollows.userId, users.id)
    )
    .innerJoin(
      feeds,
      eq(feedFollows.feedId, feeds.id)
    )
    .where(eq(feedFollows.id, newFollow.id));

  return result;
}

export async function getFeedFollowsForUser(
  userId: string
) {
  return await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(
      users,
      eq(feedFollows.userId, users.id)
    )
    .innerJoin(
      feeds,
      eq(feedFollows.feedId, feeds.id)
    )
    .where(eq(feedFollows.userId, userId));
}
export async function deleteFeedFollow(
  userId: string,
  feedUrl: string
) {
  const [deletedFollow] = await db
    .delete(feedFollows)
    .where(
      and(
        eq(feedFollows.userId, userId),
        eq(
          feedFollows.feedId,
          db
            .select({ id: feeds.id })
            .from(feeds)
            .where(eq(feeds.url, feedUrl))
        )
      )
    )
    .returning();

  return deletedFollow;
}
