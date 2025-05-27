import * as SQLite from 'expo-sqlite';
import { IMessage } from 'react-native-gifted-chat';

const DB_NAME = 'openrouter_chat.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await dbInstance.execAsync('PRAGMA foreign_keys = ON');
    await dbInstance.execAsync('PRAGMA journal_mode = WAL');
  }
  return dbInstance!;
};

export const initDatabase = async () => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY NOT NULL,
      userEmail TEXT NOT NULL,
      title TEXT,
      createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS messages (
      id        TEXT NOT NULL,
      threadId  TEXT NOT NULL,
      role      TEXT NOT NULL,
      content   TEXT,
      image     TEXT,
      createdAt INTEGER,
      userId    INTEGER,
      userName   TEXT,
      userAvatar TEXT,
      PRIMARY KEY (id, threadId),
      FOREIGN KEY (threadId) REFERENCES threads(id) ON DELETE CASCADE
    );
  `);
};

export const saveMessages = async (
  threadId: string,
  userEmail: string,
  msgs: IMessage[],
) => {
  if ((!msgs || !msgs.length) && !threadId && !userEmail) {
    console.warn('⚠️ saveMessages called with empty or undefined msgs');
    return;
  }
  const db = await getDb();

  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      // Save or update thread
      await tx.runAsync(
        `INSERT INTO threads (id, userEmail, title, createdAt)
         VALUES ($id, $email, $title, $createdAt)
         ON CONFLICT(id) DO UPDATE SET title = excluded.title`,
        {
          $id: threadId,
          $email: userEmail,
          $title: msgs[0].text?.slice(0, 50) ?? '',
          $createdAt: Date.now(),
        },
      );
      for (const m of msgs) {
        await tx?.runAsync(
          `INSERT INTO messages
              (id, threadId, role, content, image, createdAt, userId, userName, userAvatar)
            VALUES
              ($id, $threadId, $role, $content, $image, $createdAt, $userId, $userName, $userAvatar)
            ON CONFLICT(id, threadId) DO UPDATE SET
              content     = excluded.content,
              image       = excluded.image,
              createdAt   = excluded.createdAt,
              userId      = excluded.userId,
              userName    = excluded.userName,
              userAvatar  = excluded.userAvatar`,
          {
            $id: String(m._id),
            $threadId: threadId,
            $role: m.user?._id === 1 ? 'user' : 'assistant',
            $content: m.text,
            $image: m.image ?? null,
            $createdAt:
              typeof m.createdAt === 'number'
                ? m.createdAt
                : (m.createdAt as Date).getTime(),
            $userId: m.user?._id ?? null,
            $userName: m.user?.name ?? null,
            $userAvatar: m.user?.avatar ?? null,
          },
        );
      }
    });

    console.log('✅ Messages saved');
  } catch (e) {
    throw e;
  }
};

export const loadMessages = async (threadId: string) => {
  console.log('loadMessages', threadId);

  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM messages WHERE threadId = ? ORDER BY createdAt DESC`,
    threadId,
  );
  return rows.map((row: any) => ({
    _id: row.id,
    text: row.content,
    createdAt: new Date(row.createdAt),
    image: row.image || undefined,
    user: {
      _id: row.role === 'user' ? 1 : 2,
      name: row.role === 'user' ? row.userName : 'Rak-GPT',
      avatar:
        row.role === 'user' && row.userName
          ? row.userAvatar
          : 'https://avatar.iran.liara.run/public/username?username=RakGPT',
    },
  }));
};

export const loadThreadIds = async (userEmail: string) => {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT id FROM threads WHERE userEmail = ? ORDER BY createdAt DESC`,
    userEmail,
  );
  return rows.map((r: any) => ({ threadId: r.id }));
};

export const loadUserThreadsWithFirstMessage = async (userEmail: string) => {
  const db = await getDb();

  const rows = await db.getAllAsync(
    `
    SELECT
      t.id AS threadId,
      t.title,
      t.createdAt AS threadCreatedAt,
      m.id AS messageId,
      m.content AS firstMessageText,
      m.createdAt AS firstMessageCreatedAt,
      m.role AS firstMessageRole
    FROM threads t
    LEFT JOIN (
      SELECT threadId, id, content, createdAt, role
      FROM messages
      WHERE (threadId, createdAt) IN (
        SELECT threadId, MIN(createdAt)
        FROM messages
        GROUP BY threadId
      )
    ) m ON t.id = m.threadId
    WHERE t.userEmail = ?
    ORDER BY t.createdAt DESC
    `,
    userEmail,
  );

  return rows.map((row: any) => ({
    threadId: row.threadId,
    title: row.title,
    threadCreatedAt: new Date(row.threadCreatedAt),
    firstMessage: row.firstMessageText
      ? {
          _id: row.messageId,
          text: row.firstMessageText,
          createdAt: new Date(row.firstMessageCreatedAt),
          user: {
            _id: row.firstMessageRole === 'user' ? 1 : 2,
            name: row.firstMessageRole === 'user' ? 'User' : 'Rak-GPT',
            avatar:
              row.firstMessageRole === 'user'
                ? undefined
                : 'https://avatar.iran.liara.run/public/username?username=RakGPT',
          },
        }
      : null,
  }));
};
