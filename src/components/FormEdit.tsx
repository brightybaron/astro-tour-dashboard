import { useState, useEffect } from "react";
import type { Post, Image as ImageType } from "@prisma/client";
import { slugify } from "@lib/utils";

// Define types outside the component for better organization
type ItineraryItem = {
  time: string;
  details: string;
};

type DayItinerary = {
  title: string;
  items: ItineraryItem[];
};

interface EditPostFormProps {
  content: Post & { images: ImageType[] };
  bucketUrl: string;
}

const EditPostForm: React.FC<EditPostFormProps> = ({
  content,
  bucketUrl,
}: EditPostFormProps) => {
  const [nama, setNama] = useState(content.nama || "");
  const [slug, setSlug] = useState(slugify(content.nama || ""));

  const handleNamaChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setNama(value);
    setSlug(slugify(value));
  };

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string }[]
  >([]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [itineraries, setItineraries] = useState<DayItinerary[]>([
    {
      title: "",
      items: [{ time: "", details: "" }],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Constants for validation
  const MAX_IMAGES = 5; // Making this consistent with UI text
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  // Fetch post data on component mount
  useEffect(() => {
    const extractedDescription =
      content.descriptions && Array.isArray(content.descriptions)
        ? (content.descriptions as { description: string }[]).map(
            (desc) => desc.description
          )
        : [""];
    setDescriptions(extractedDescription.length ? extractedDescription : [""]);

    // Ensure itineraries is properly initialized
    setItineraries(
      Array.isArray(content.itineraries) && content.itineraries.length > 0
        ? (content.itineraries as DayItinerary[])
        : [{ title: "", items: [{ time: "", details: "" }] }]
    );

    // Set existing images if available
    setExistingImages(Array.isArray(content.images) ? content.images : []);

    setIsDataLoading(false);
  }, [content]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = files.filter((file) => file.size <= MAX_IMAGE_SIZE);

    if (files.length !== validFiles.length) {
      alert(`Some images exceed the maximum size of 10MB and were not added.`);
    }

    const totalImages =
      validFiles.length + existingImages.length + selectedImages.length;
    if (totalImages > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images total.`);
    }

    const newImages = validFiles.slice(
      0,
      MAX_IMAGES - existingImages.length - selectedImages.length
    );
    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    if (confirm("Are you sure you want to remove this image?")) {
      setSelectedImages((prevImages) =>
        prevImages.filter((_, i) => i !== index)
      );
    }
  };

  const handleRemoveExistingImage = (id: string) => {
    if (
      confirm(
        "Are you sure you want to remove this image? This cannot be undone."
      )
    ) {
      setExistingImages((prevImages) =>
        prevImages.filter((img) => img.id !== id)
      );
    }
  };

  const handleItineraryChange = (
    dayIndex: number,
    index: number,
    field: keyof ItineraryItem,
    value: string
  ) => {
    const updatedItineraries = [...itineraries];
    if (
      updatedItineraries[dayIndex] &&
      updatedItineraries[dayIndex].items[index]
    ) {
      updatedItineraries[dayIndex].items[index][field] = value;
      setItineraries(updatedItineraries);
    }
  };

  const handleItineraryTitleChange = (dayIndex: number, value: string) => {
    const updatedItineraries = [...itineraries];
    if (updatedItineraries[dayIndex]) {
      updatedItineraries[dayIndex].title = value;
      setItineraries(updatedItineraries);
    }
  };

  const handleAddItinerary = (dayIndex: number) => {
    const updatedItineraries = [...itineraries];
    if (updatedItineraries[dayIndex]) {
      updatedItineraries[dayIndex].items.push({ time: "", details: "" });
      setItineraries(updatedItineraries);
    }
  };

  const handleRemoveItinerary = (dayIndex: number, index: number) => {
    if (!itineraries[dayIndex] || itineraries[dayIndex].items.length <= 1) {
      alert("At least one itinerary item is required for each day.");
      return;
    }

    if (confirm("Are you sure you want to remove this itinerary item?")) {
      const updatedItineraries = [...itineraries];
      updatedItineraries[dayIndex].items.splice(index, 1);
      setItineraries(updatedItineraries);
    }
  };

  const handleAddDay = () => {
    setItineraries([
      ...itineraries,
      {
        title: "",
        items: [{ time: "", details: "" }],
      },
    ]);
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (itineraries.length <= 1) {
      alert("At least one day is required for the itinerary.");
      return;
    }

    if (
      confirm(
        "Are you sure you want to remove this entire day? All items will be lost."
      )
    ) {
      const updatedItineraries = [...itineraries];
      updatedItineraries.splice(dayIndex, 1);
      setItineraries(updatedItineraries);
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedDescriptions = [...descriptions];
    updatedDescriptions[index] = value;
    setDescriptions(updatedDescriptions);
  };

  const handleAddDescription = () => {
    setDescriptions([...descriptions, ""]);
  };

  const handleRemoveDescription = (index: number) => {
    if (descriptions.length <= 1) {
      alert("At least one description is required.");
      return;
    }

    if (confirm("Are you sure you want to remove this description?")) {
      const updatedDescriptions = [...descriptions];
      updatedDescriptions.splice(index, 1);
      setDescriptions(updatedDescriptions);
    }
  };

  const validatePrices = (pricesText: string): boolean => {
    if (!pricesText.trim()) {
      alert("Please enter at least one price.");
      return false;
    }

    const prices = pricesText.split(",").map((p) => p.trim());
    for (const price of prices) {
      if (!/^\d+$/.test(price)) {
        alert(`Invalid price: ${price}. Please enter numbers only.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content) {
      alert("Error: Post content is missing");
      return;
    }

    // Validate prices before submission
    const priceInput = (
      event.currentTarget.elements.namedItem("harga") as HTMLInputElement
    ).value;
    if (!validatePrices(priceInput)) {
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    formData.append("oldSlug", content.slug);

    const mappedDescriptions = descriptions.map((description) => ({
      description,
    }));

    const mappedItineraries = itineraries.map((dayItinerary) => ({
      title: dayItinerary.title,
      items: dayItinerary.items.map((item) => ({
        time: item.time,
        details: item.details,
      })),
    }));

    formData.append("itinerary", JSON.stringify(mappedItineraries));
    formData.append("description", JSON.stringify(mappedDescriptions));

    formData.append(
      "existingImages",
      JSON.stringify(existingImages.map((img) => img.id))
    );

    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        if (image.size <= MAX_IMAGE_SIZE && image.type.startsWith("image/")) {
          formData.append("photos", image);
        }
      });
    }

    try {
      const response = await fetch(`/api/update-post`, {
        method: "PUT",
        body: formData,
      });

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (response.ok) {
        alert("Post updated successfully!");
        window.location.href = "/dashboard";
      } else if (response.status === 400) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        console.log("Error updating form", errorData);
      } else {
        alert("Error updating form: " + response.statusText);
        console.log("Error updating form", response.statusText);
      }
    } catch (error) {
      alert("Error updating form. Please try again later.");
      console.log("Error updating form", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <div className="text-center py-8">Loading post data...</div>;
  }

  if (!content) {
    return <div className="text-center py-8">Post not found</div>;
  }

  return (
    <form
      className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md"
      onSubmit={handleSubmit}
      method="PUT"
      encType="multipart/form-data"
    >
      {/* Title */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700" htmlFor="title">
          Nama Trip
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          placeholder="e.g Lombok 3D2N"
          required
          value={nama}
          onChange={handleNamaChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="">
          <label className="block font-medium text-gray-700" htmlFor="slug">
            New Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 bg-slate-200 rounded-md"
            placeholder="e.g Lombok 3D2N"
            required
            value={slug}
            disabled
          />
        </div>
        <div className="">
          <label className="block font-medium text-gray-700" htmlFor="oldSlug">
            Old Slug
          </label>
          <input
            type="text"
            id="oldSlug"
            name="oldSlug"
            className="mt-1 block w-full py-1 px-2 text-sm border bg-slate-200 border-gray-300 rounded-md"
            placeholder="e.g Lombok 3D2N"
            required
            defaultValue={content.slug || ""}
            disabled
          />
        </div>
      </div>

      {/* LOkasi trip */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700" htmlFor="lokasi">
          Lokasi
        </label>
        <input
          type="text"
          id="lokasi"
          name="lokasi"
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          placeholder=" e.g Malang"
          required
          defaultValue={content.lokasi || ""}
        />
      </div>

      {/* Jenis Trip */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700" htmlFor="jenistrip">
          Jenis Trip
        </label>
        <select
          id="jenistrip"
          name="jenistrip"
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          required
          defaultValue={content.jenistrip || ""}
        >
          <option value="">-</option>
          <option value="Private">Private Trip</option>
          <option value="Open">Open Trip</option>
        </select>
      </div>

      <div className="flex justify-between gap-2">
        {/* Highlight */}
        <div className="mb-4 w-full">
          <label
            className="block font-medium text-gray-700"
            htmlFor="highlight"
          >
            Highlight
          </label>
          <textarea
            id="highlight"
            name="highlight"
            rows={3}
            className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
            placeholder="Highlight (comma separated) e.g Mengunjungi Tanah Lot, Dinner di Jimbaran"
            required
            defaultValue={
              Array.isArray(content.highlight)
                ? content.highlight.join(", ")
                : ""
            }
          />
        </div>
      </div>

      {/* Destinasi */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700" htmlFor="destinasi">
          Destinasi
        </label>
        <textarea
          id="destinasi"
          name="destinasi"
          rows={3}
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          placeholder="Destinations (comma separated) e.g. Kawah, Pasir Putih"
          required
          defaultValue={
            Array.isArray(content.destinasi) ? content.destinasi.join(", ") : ""
          }
        />
      </div>

      {/* Fasilitas */}
      <div className="mb-4 w-full">
        <label className="block font-medium text-gray-700" htmlFor="fasilitas">
          Fasilitas
        </label>
        <textarea
          rows={3}
          id="fasilitas"
          name="fasilitas"
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          placeholder="Fasilitas (comma separated) e.g. Dokumentasi, Tiket masuk"
          required
          defaultValue={
            Array.isArray(content.fasilitas) ? content.fasilitas.join(", ") : ""
          }
        />
      </div>

      {/* Prices */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700" htmlFor="harga">
          Harga
        </label>
        <input
          type="text"
          id="harga"
          name="harga"
          className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
          placeholder="Harga (comma separated, only numbers) e.g. 350, 1.500"
          required
          defaultValue={
            Array.isArray(content.harga) ? content.harga.join(", ") : ""
          }
        />
      </div>

      {/* Photos */}
      <div className="mb-4 w-full">
        <label
          htmlFor="file-upload"
          className="block font-medium leading-6 text-gray-900"
        >
          Photos
        </label>
        <p className="text-sm text-gray-600 mb-2">Existing photos:</p>

        {existingImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {existingImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={`${bucketUrl}/${image.url}`}
                  alt="Existing"
                  className="h-auto w-48 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                  onClick={() => handleRemoveExistingImage(image.id)}
                  aria-label="Remove Image"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-2">No existing photos</p>
        )}

        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
              <label
                htmlFor="photos"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span>
                  {selectedImages.length > 0
                    ? "Add more image(s)"
                    : "Upload new image(s)"}
                </span>
                <input
                  id="photos"
                  name="photos"
                  type="file"
                  multiple
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 10MB (max. {MAX_IMAGES} images total)
            </p>
            <div id="selected-images" className="mt-2 grid grid-cols-3 gap-2">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative m-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-auto w-48 object-cover"
                  />
                  <button
                    type="button"
                    className="remove-image-btn absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                    onClick={() => handleRemoveImage(index)}
                    aria-label="Remove Image"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="mb-4">
        <p className="block font-medium text-gray-700">Itinerary</p>

        {itineraries.map((dayItinerary, dayIndex) => (
          <div key={dayIndex}>
            <div className="flex justify-between items-center">
              <div className="flex flex-col mb-2">
                <label className="text-sm font-medium text-gray-800 mt-4">
                  Day {dayIndex + 1} Title
                </label>
                <input
                  type="text"
                  value={dayItinerary.title || ""}
                  onChange={(e) =>
                    handleItineraryTitleChange(dayIndex, e.target.value)
                  }
                  className="mt-1 block w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g Mengunjungi Tanah Lot"
                />
              </div>
              {itineraries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(dayIndex)}
                  className="text-red-700 hover:text-red-700 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-1"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                  <span className="ml-1 text-sm font-medium">Remove Day</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-x-2">
              <div className="col-span-1">
                <p className="text-sm text-gray-700">Time</p>
              </div>
              <div className="col-span-4">
                <p className="text-sm text-gray-700">Details</p>
              </div>
            </div>

            {dayItinerary.items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-x-2 mt-2">
                <div className="col-span-1">
                  <input
                    type="text"
                    value={item.time || ""}
                    onChange={(e) =>
                      handleItineraryChange(
                        dayIndex,
                        index,
                        "time",
                        e.target.value
                      )
                    }
                    className="block w-full py-1 sm:px-2 px-[6px] text-sm border border-gray-300 rounded-md"
                    placeholder="08.00"
                    required
                  />
                </div>
                <div className="col-span-4 flex gap-x-2">
                  <input
                    type="text"
                    value={item.details || ""}
                    onChange={(e) =>
                      handleItineraryChange(
                        dayIndex,
                        index,
                        "details",
                        e.target.value
                      )
                    }
                    className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
                    placeholder={`Menuju resto makan siang di ${index + 1}`}
                    required
                  />
                  {dayItinerary.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItinerary(dayIndex, index)}
                      className="text-red-700 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 mr-1"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItinerary(dayIndex)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Itinerary for Day {dayIndex + 1}
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddDay}
          className="mt-2 text-sm font-bold text-blue-500 hover:text-blue-700"
        >
          + Add Day
        </button>
      </div>

      {/* Deskripsi */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block font-medium text-gray-700"
        >
          Deskripsi
        </label>

        {descriptions.map((description, index) => (
          <div key={index} className="flex items-center gap-x-2 mt-2">
            <textarea
              id={`description-${index}`}
              name={`description-${index}`}
              rows={2}
              value={description || ""}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md shadow-sm"
              placeholder={`Lorem ipsum dolor sit amet... ( ${index + 1} )`}
              required
            />
            {descriptions.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveDescription(index)}
                className="text-red-700 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 mr-1"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddDescription}
          className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-700"
        >
          + Add Description
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end gap-4">
        <div className="flex-1">
          <button
            className="mt-4 px-4 py-2 w-full bg-slate-200  rounded-md hover:bg-slate-300 hover:cursor-pointer"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
        <button
          type="submit"
          className={`mt-4 px-4 py-2 w-full bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Post"}
        </button>
      </div>
    </form>
  );
};

export default EditPostForm;
