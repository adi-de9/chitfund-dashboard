import { prisma } from "../../lib/prisma";

// Upload document (Mock upload for now, just saving URL)
export const uploadDocument = async (
  userId: string,
  docType: "aadhaar" | "pan" | "photo",
  fileUrl: string
) => {
  return await prisma.document.create({
    data: {
      user_id: BigInt(userId),
      doc_type: docType,
      file_url: fileUrl,
    },
  });
};

// View all documents for a user
export const getDocuments = async (userId: string) => {
  return await prisma.document.findMany({
    where: { user_id: BigInt(userId) },
  });
};

// Delete document
export const deleteDocument = async (id: string) => {
  return await prisma.document.delete({
    where: { id: BigInt(id) },
  });
};
