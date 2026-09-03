import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../src/lib/prisma";

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  advanced: {
    cookiePrefix: "kanban",
  },
});

const DEMO_USER = {
  name: "Bashar",
  email: "bashar@flow.com",
  password: "password123",
};

const TEAM_USERS = [
  { name: "Andrea", email: "andrea@flow.com", password: "password123" },
  { name: "Karen", email: "karen@flow.com", password: "password123" },
  { name: "Samantha", email: "samantha@flow.com", password: "password123" },
];

async function upsertUser(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return existing;
  }
  const res = await auth.api.signUpEmail({ body: input });
  console.log(`Created user ${input.email} (${res.user.id})`);
  return res.user;
}

async function main() {
  console.log("Seeding authentic demo data matching UI designs...");

  const owner = await upsertUser(DEMO_USER);
  const team = [];
  for (const u of TEAM_USERS) {
    team.push(await upsertUser(u));
  }

  // 1. Primary Board matching Image 1: "Homepage Design"
  let homepageBoard = await prisma.board.findFirst({
    where: { title: "Homepage Design" },
  });

  if (!homepageBoard) {
    homepageBoard = await prisma.board.create({
      data: {
        title: "Homepage Design",
        description: "New landing page & brand identity",
        ownerId: owner.id,
        isFavorite: true,
        members: {
          create: [
            { userId: owner.id, role: "OWNER" },
            { userId: team[0].id, role: "EDITOR" },
            { userId: team[1].id, role: "EDITOR" },
            { userId: team[2].id, role: "VIEWER" },
          ],
        },
      },
    });

    const columnsData = [
      {
        title: "Task Ready",
        tasks: [
          {
            title: "Konsep hero title yang menarik",
            category: "Copywriting",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Andrea",
          },
          {
            title: "Icon di section our services",
            category: "UI Design",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Karen",
          },
        ],
      },
      {
        title: "On Progress",
        tasks: [
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "UI Design",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Samantha",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Illustration",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Andrea",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Copywriting",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Karen",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Illustration",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Samantha",
          },
        ],
      },
      {
        title: "Needs Review",
        tasks: [
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Copywriting",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Karen",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "UI Design",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Samantha",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Illustration",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Andrea",
          },
        ],
      },
      {
        title: "Done",
        tasks: [
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Illustration",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Samantha",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "Copywriting",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Andrea",
          },
          {
            title: "Membuat konsep ilustrasi untuk halaman about us",
            category: "UI Design",
            dueDate: "Nov 24",
            commentsCount: 2,
            attachmentsCount: 5,
            assigneeId: "Karen",
          },
        ],
      },
    ];

    let colPos = 1000;
    for (const col of columnsData) {
      const createdCol = await prisma.column.create({
        data: {
          boardId: homepageBoard.id,
          title: col.title,
          position: colPos,
        },
      });
      colPos += 1000;

      let taskPos = 1000;
      for (const t of col.tasks) {
        await prisma.task.create({
          data: {
            columnId: createdCol.id,
            title: t.title,
            category: t.category,
            dueDate: t.dueDate,
            commentsCount: t.commentsCount,
            attachmentsCount: t.attachmentsCount,
            assigneeId: t.assigneeId,
            position: taskPos,
            createdById: owner.id,
          },
        });
        taskPos += 1000;
      }
    }

    // Seed Activities matching Image 1
    const activities = [
      { userName: "Andrea", action: "uploaded 3 documents", iconColor: "orange" },
      { userName: "Karen", action: "left some comments", iconColor: "green" },
      { userName: "Karen", action: "changed project descriptions", iconColor: "purple" },
      { userName: "Andrea", action: "uploaded 3 documents", iconColor: "orange" },
      { userName: "Karen", action: "left some comments", iconColor: "green" },
    ];

    for (const act of activities) {
      await prisma.boardActivity.create({
        data: {
          boardId: homepageBoard.id,
          userName: act.userName,
          action: act.action,
          iconColor: act.iconColor,
        },
      });
    }
  }

  // 2. Dashboard Boards matching Image 2
  const additionalBoards = [
    { title: "Website Redesign", description: "New landing & brand", isFav: true },
    { title: "Product Development", description: "Sprint 23", isFav: true },
    { title: "Marketing Campaign", description: "Q4 launch", isFav: false },
    { title: "Mobile App", description: "React Native", isFav: true },
  ];

  for (const b of additionalBoards) {
    const exists = await prisma.board.findFirst({ where: { title: b.title } });
    if (!exists) {
      const created = await prisma.board.create({
        data: {
          title: b.title,
          description: b.description,
          ownerId: owner.id,
          isFavorite: b.isFav,
          members: {
            create: [{ userId: owner.id, role: "OWNER" }],
          },
        },
      });

      // Add default columns
      const col = await prisma.column.create({
        data: {
          boardId: created.id,
          title: "To Do",
          position: 1000,
        },
      });

      await prisma.task.create({
        data: {
          columnId: col.id,
          title: `Initial scope for ${b.title}`,
          category: "UI Design",
          dueDate: "Nov 28",
          commentsCount: 1,
          attachmentsCount: 2,
          assigneeId: "Andrea",
          position: 1000,
          createdById: owner.id,
        },
      });
    }
  }

  console.log("Demo seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
