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
  const { title, content, tags, favorite } = req.body;

  try {
    const note = await prisma.note.create({
      data: { 
        title, 
        content, 
        tags: tags ? JSON.stringify(tags) : "[]",
        favorite: favorite || false,
        userId: req.user.id 
      },
    });

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: "Error al crear nota" });
  }
};

export const updateNote = async (req, res) => {
  const { title, content, tags, favorite } = req.body;

  try {
    const note = await prisma.note.update({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { 
        title, 
        content, 
        tags: tags ? JSON.stringify(tags) : "[]",
        favorite: favorite !== undefined ? favorite : undefined,  // Agregado
      },
    });

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar nota" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await prisma.note.delete({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });

    res.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    res.status(404).json({ message: "Error al eliminar nota" });
  }
};

export const archiveNote = async (req, res) => {
  try {
    const note = await prisma.note.update({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { archived: true },
    });

    res.json({ message: "Nota archivada correctamente", note });
  } catch (error) {
    res.status(400).json({ message: "Error al archivar nota" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });

    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: { favorite: !note.favorite },  // Cambia el estado actual
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el estado de favorito" });
  }
};