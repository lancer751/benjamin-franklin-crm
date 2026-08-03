export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "cebf_uploads");
  formData.append("cloud_name", "dnvgab0j0");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dnvgab0j0/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Detalle del error de imagen en Cloudinary:", errorData);
      throw new Error("Error al subir la imagen a Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Image Error:", error);
    throw error;
  }
};

export const uploadPdfToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "cebf_uploads");
  formData.append("cloud_name", "dnvgab0j0");

  try {
    const response = await fetch(
      // 👇 CAMBIAMOS '/auto/upload' POR '/raw/upload'
      `https://api.cloudinary.com/v1_1/dnvgab0j0/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Detalle del error de PDF en Cloudinary:", errorData);
      throw new Error("Error al subir el archivo PDF a Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; // Te devolverá una URL con '/raw/upload/' que no sufre este bloqueo
  } catch (error) {
    console.error("Cloudinary PDF Error:", error);
    throw error;
  }
};
