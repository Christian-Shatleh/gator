
import {
  CommandsRegistry,
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollow,
  handlerFollowing,
  middlewareLoggedIn,
  registerCommand,
  runCommand,
  handlerUnfollow,
  handlerBrowse,
} from "./command.js";

async function main() {
  const registry: CommandsRegistry = {};

  // Regular commands
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "feeds", handlerFeeds);

  // Commands requiring a logged-in user
  registerCommand(
    registry,
    "addfeed",
    middlewareLoggedIn(handlerAddFeed)
  );

  registerCommand(
    registry,
    "follow",
    middlewareLoggedIn(handlerFollow)
  );

  registerCommand(
    registry,
    "following",
    middlewareLoggedIn(handlerFollowing)
  );

  registerCommand(
    registry,
    "unfollow",
    middlewareLoggedIn(handlerUnfollow)
  );

  registerCommand(
    registry,
    "browse",
    middlewareLoggedIn(handlerBrowse)
  );

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("not enough arguments");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
