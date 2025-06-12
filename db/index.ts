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
      id          TEXT NOT NULL,
      threadId    TEXT NOT NULL,
      role        TEXT NOT NULL,
      content     TEXT,
      image       TEXT,
      fileName    TEXT,
      fileUri     TEXT,
      fileMime    TEXT,
      fileSize    INTEGER,
      createdAt   INTEGER,
      userId      INTEGER,
      userName    TEXT,
      userAvatar  TEXT,
      PRIMARY KEY (id, threadId),
      FOREIGN KEY (threadId) REFERENCES threads(id) ON DELETE CASCADE
    );
  `);

  const columnsToAdd = [
    { name: 'fileName', type: 'TEXT' },
    { name: 'fileUri', type: 'TEXT' },
    { name: 'fileMime', type: 'TEXT' },
    { name: 'fileSize', type: 'INTEGER' },
  ];

  for (const col of columnsToAdd) {
    try {
      await db.execAsync(
        `ALTER TABLE messages ADD COLUMN ${col.name} ${col.type}`,
      );
      console.log(`✅ Added column: ${col.name}`);
    } catch (err: any) {
      if (err.message.includes('duplicate column name')) {
      } else {
        throw err;
      }
    }
  }
};

export const saveMessages = async (
  threadId: string,
  userEmail: string,
  msgs: IMessage[],
) => {
  if ((!msgs || !msgs.length) && !threadId && !userEmail) {
    console.warn('saveMessages called with empty or undefined msgs');
    return;
  }
  const db = await getDb();

  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
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
              (id, threadId, role, content, image, fileName, fileUri, fileMime, fileSize, createdAt, userId, userName, userAvatar)
            VALUES
              ($id, $threadId, $role, $content, $image, $fileName, $fileUri, $fileMime, $fileSize, $createdAt, $userId, $userName, $userAvatar)
            ON CONFLICT(id, threadId) DO UPDATE SET
              content     = excluded.content,
              image       = excluded.image,
              fileName    = excluded.fileName,
              fileUri     = excluded.fileUri,
              fileMime    = excluded.fileMime,
              fileSize    = excluded.fileSize,
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
            $fileName: m.file?.name ?? null,
            $fileUri: m.file?.uri ?? null,
            $fileMime: m.file?.mimeType ?? null,
            $fileSize: m.file?.size ?? null,
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
    file:
      row.fileUri != null
        ? {
            name: row.fileName,
            uri: row.fileUri,
            mimeType: row.fileMime,
            size: row.fileSize,
          }
        : undefined,
  }));
};

export const loadThreadIds = async (userEmail: string) => {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT id FROM threads WHERE userEmail = ? ORDER BY createdAt DESC`,
    userEmail,
  );
  return rows.map((r: any) => r.id);
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
      m.role AS firstMessageRole,
      m.userName,
      m.userAvatar,
      m.fileName,
      m.fileUri,
      m.fileMime,
      m.fileSize
    FROM threads t
    LEFT JOIN (
      SELECT threadId, id, content, createdAt, role, userName, userAvatar, fileName, fileUri, fileMime, fileSize
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
            name:
              row.firstMessageRole === 'user'
                ? row.userName ?? 'User'
                : 'Rak-GPT',
            avatar:
              row.firstMessageRole === 'user'
                ? row.userAvatar
                : 'https://avatar.iran.liara.run/public/username?username=RakGPT',
          },
          file:
            row.fileUri != null
              ? {
                  name: row.fileName,
                  uri: row.fileUri,
                  mimeType: row.fileMime,
                  size: row.fileSize,
                }
              : undefined,
        }
      : null,
  }));
};
