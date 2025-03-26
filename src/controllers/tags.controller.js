import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTag = async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ message: "El nombre del tag es requerido" });
    }
  
    try {
      const tag = await prisma.tag.create({
        data: { name },
      });
  
      res.json(tag);
    } catch (error) {
      console.error("Error al crear el tag:", error);
      res.status(500).json({ message: "Error al crear el tag" });
    }
};

export const getTags = async (req, res) => {
    try {
      const tags = await prisma.tag.findMany();
      res.json(tags);
    } catch (error) {
      console.error("Error al obtener los tags:", error);
      res.status(500).json({ message: "Error al obtener los tags" });
    }
};

export const getTagById = async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
  
      if (isNaN(tagId)) {
        return res.status(400).json({ message: "ID de tag inválido" });
      }
  
      const tag = await prisma.tag.findUnique({
        where: { id: tagId },
      });
  
      if (!tag) {
        return res.status(404).json({ message: "Tag no encontrado" });
      }
  
      res.json(tag);
    } catch (error) {
      console.error("Error al obtener el tag:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    
    const tag = await prisma.tag.findUnique({
      where: { id: Number(id) },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag no encontrado" });
    }


    const tagAssociations = await prisma.noteTag.findMany({
      where: { tagId: Number(id) },
    });

    if (tagAssociations.length > 0) {
      return res
        .status(400)
        .json({ message: "No se puede eliminar el tag porque está asociado a una o más notas" });
    }

 
    await prisma.tag.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Tag eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar tag:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};