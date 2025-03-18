import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getNotes = async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.user.id },
  });

  const formattedNotes = notes.map(note => ({
    ...note,
    tags: JSON.parse(note.tags),
  }));

  res.json(formattedNotes);
};

export const getNote = async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: parseInt(req.params.id), userId: req.user.id },
  });

  if (!note) return res.status(404).json({ message: "Nota no encontrada" });
  res.json({ ...note, tags: JSON.parse(note.tags) });
};

export const createNote = async (req, res) => {
  const { title, content, tags } = req.body;

  try {
    const note = await prisma.note.create({
      data: { 
        title, 
        content, 
        tags: tags ? JSON.stringify(tags) : "[]",
        userId: req.user.id 
      },
    });

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: "Error al crear nota" });
  }
};