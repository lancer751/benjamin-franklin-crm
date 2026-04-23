export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  
  // Reemplaza con tus datos de las capturas anteriores
  formData.append("file", file);
  formData.append("upload_preset", "cebf_uploads"); // El nombre que creaste en el paso 1
  formData.append("cloud_name", "dnvgab0j0"); // Tu Cloud Name de la captura

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dnvgab0j0/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Error al subir imagen");

    const data = await response.json();
    return data.secure_url; // Esta es la URL https:// que le mandaremos al backend
  } catch (error) {
    console.error("Cloudinary Error:", error);
    throw error;
  }
};