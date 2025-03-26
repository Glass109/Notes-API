import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getNotes = async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.user.id },
    include: {
      tags: { select: { tag: true } },
    },
  });

  const formattedNotes = notes.map((note) => ({
    ...note,
    tags: note.tags.map((noteTag) => noteTag.tag.name),
  }));

  res.json(formattedNotes);
};

export const getNote = async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    const userId = Number(req.user.id);

    if (isNaN(noteId)) {
      return res.status(400).json({ message: "ID de nota inválido" });
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId }, 
      include: {
        tags: { select: { tag: true } }, 
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    if (note.userId !== userId) {
      return res.status(403).json({ message: "No tienes permiso para ver esta nota" });
    }

    res.json({
      ...note,
      tags: note.tags.map((noteTag) => noteTag.tag.name), 
    });
  } catch (error) {
    console.error("Error en getNote:", error);
    res.status(500).json({ message: "Error al obtener la nota" });
  }
};

export const createNote = async (req, res) => {
  const { title, content, tags, favorite } = req.body;

  try {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        favorite: favorite || false,
        userId: req.user.id,
        tags: {
          create: tags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: { select: { tag: true } },
      },
    });

    res.json({
      ...note,
      tags: note.tags.map((noteTag) => noteTag.tag.name),
    });
  } catch (error) {
    res.status(400).json({ message: "Error al crear nota" });
  }
};

export const updateNote = async (req, res) => {
  const { title, content, tags, favorite } = req.body;

  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        AND: [
          { id: parseInt(req.params.id) },
          { userId: req.user.id },
        ],
      },
    });

    if (!existingNote) return res.status(404).json({ message: "Nota no encontrada" });

    const note = await prisma.note.update({
      where: { id: existingNote.id },
      data: {
        title,
        content,
        favorite: favorite !== undefined ? favorite : undefined,
        tags: {
          deleteMany: {}, 
          create: tags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: { select: { tag: true } },
      },
    });

    res.json({
      ...note,
      tags: note.tags.map((noteTag) => noteTag.tag.name),
    });
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar nota" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        AND: [
          { id: parseInt(req.params.id) },
          { userId: req.user.id },
        ],
      },
    });

    if (!existingNote) return res.status(404).json({ message: "Nota no encontrada" });

    await prisma.note.update({
      where: { id: existingNote.id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    res.status(404).json({ message: "Error al eliminar nota" });
  }
};

export const archiveNote = async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        AND: [
          { id: parseInt(req.params.id) },
          { userId: req.user.id },
        ],
      },
    });

    if (!existingNote) return res.status(404).json({ message: "Nota no encontrada" });

    const note = await prisma.note.update({
      where: { id: existingNote.id },
      data: { archived: true },
    });

    res.json({ message: "Nota archivada correctamente", note });
  } catch (error) {
    res.status(400).json({ message: "Error al archivar nota" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        AND: [
          { id: parseInt(req.params.id) },
          { userId: req.user.id },
        ],
      },
    });

    if (!existingNote) return res.status(404).json({ message: "Nota no encontrada" });

    const updatedNote = await prisma.note.update({
      where: { id: existingNote.id },
      data: { favorite: !existingNote.favorite },
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el estado de favorito" });
  }
};

export const getFavoriteNotes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const userId = Number(req.user.id);

    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        favorite: true,
      },
      include: {
        tags: { select: { tag: true } },
      },
    });

    const formattedNotes = notes.map((note) => ({
      ...note,
      tags: note.tags.map((noteTag) => noteTag.tag.name),
    }));

    res.json(formattedNotes);
  } catch (error) {
    console.error("Error al obtener notas favoritas:", error);
    res.status(500).json({ message: "Error al obtener notas favoritas" });
  }
};