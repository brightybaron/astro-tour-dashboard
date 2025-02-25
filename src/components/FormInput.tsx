import { useState } from "react";

// Define types outside the component for better organization
type ItineraryItem = {
  time: string;
  details: string;
};

type DayItinerary = {
  title: string;
  items: ItineraryItem[];
};

const CreatePostForm: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [itineraries, setItineraries] = useState<DayItinerary[]>([
    {
      title: "",
      items: [{ time: "", details: "" }],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageError, setShowImageError] = useState(false);

  // Constants for validation - consistent values
  const MAX_IMAGES = 5;
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB - made consistent with UI text

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = files.filter((file) => file.size <= MAX_IMAGE_SIZE);

    // Reset image error state when files are added
    setShowImageError(false);

    if (files.length !== validFiles.length) {
      alert(`Some images exceed the maximum size of 10MB and were not added.`);
    }

    if (validFiles.length + selectedImages.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images.`);
    }

    const newImages = validFiles.slice(0, MAX_IMAGES - selectedImages.length);
    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleItineraryChange = (
    dayIndex: number,
    index: number,
    field: keyof ItineraryItem,
    value: string
  ) => {
    const updatedItineraries = [...itineraries];
    updatedItineraries[dayIndex].items[index][field] = value;
    setItineraries(updatedItineraries);
  };

  const handleItineraryTitleChange = (dayIndex: number, value: string) => {
    const updatedItineraries = [...itineraries];
    updatedItineraries[dayIndex].title = value;
    setItineraries(updatedItineraries);
  };

  const handleAddItinerary = (dayIndex: number) => {
    const updatedItineraries = [...itineraries];
    updatedItineraries[dayIndex].items.push({ time: "", details: "" });
    setItineraries(updatedItineraries);
  };

  const handleRemoveItinerary = (dayIndex: number, index: number) => {
    if (itineraries[dayIndex].items.length <= 1) {
      alert("At least one itinerary item is required for each day.");
      return;
    }

    const updatedItineraries = [...itineraries];
    updatedItineraries[dayIndex].items.splice(index, 1);
    setItineraries(updatedItineraries);
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

    const updatedItineraries = [...itineraries];
    updatedItineraries.splice(dayIndex, 1);
    setItineraries(updatedItineraries);
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

    const updatedDescriptions = [...descriptions];
    updatedDescriptions.splice(index, 1);
    setDescriptions(updatedDescriptions);
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

    // Check if images are selected
    if (selectedImages.length === 0) {
      setShowImageError(true);
      return;
    }

    // Validate prices before submission
    const form = event.currentTarget;
    const priceInput = form.elements.namedItem("harga") as HTMLInputElement;

    if (!priceInput || !validatePrices(priceInput.value)) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData(form);

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

    selectedImages.forEach((image, index) => {
      formData.append(`photos[${index}]`, image);
    });

    try {
      const response = await fetch("/api/create-post", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Post created successfully!");
        setSelectedImages([]);
        setDescriptions([""]);
        setItineraries([{ title: "", items: [{ time: "", details: "" }] }]);
        window.location.href = "/dashboard";
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        alert(`Error: ${errorData.message || "An unknown error occurred"}`);
        console.log("Error submitting form:", errorData);
      }
    } catch (error) {
      alert("Error submitting form. Please try again later.");
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md"
      onSubmit={handleSubmit}
      method="POST"
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
        />
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
          placeholder="Harga (comma separated, only numbers) e.g. 350, 1500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Gunakan angka tanpa titik atau koma sebagai pemisah ribuan (contoh:
          1500, bukan 1.500)
        </p>
      </div>

      {/* Photos */}
      <div className="mb-4 w-full">
        <label
          htmlFor="file-upload"
          className="block font-medium leading-6 text-gray-900"
        >
          Photos{" "}
          {showImageError && (
            <span className="text-red-500 text-sm ml-2">
              * Wajib upload minimal 1 foto
            </span>
          )}
        </label>
        <div
          className={`mt-2 flex justify-center rounded-lg border border-dashed ${showImageError ? "border-red-500" : "border-gray-900/25"} px-6 py-10`}
        >
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
                    ? "Add image(s)"
                    : "Upload image(s)"}
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
              PNG, JPG, GIF up to 10MB (max. {MAX_IMAGES} images)
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
                    className="remove-image-btn absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
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
                  value={dayItinerary.title}
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
                  className="text-red-700 hover:text-red-900 flex items-center transition-colors"
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
                    value={item.time}
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
                    value={item.details}
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
                      className="text-red-700 hover:text-red-900 transition-colors"
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
              className="mt-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
            >
              + Add Itinerary for Day {dayIndex + 1}
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddDay}
          className="mt-2 text-sm font-bold text-blue-500 hover:text-blue-700 transition-colors"
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
              value={description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md shadow-sm"
              placeholder={`Lorem ipsum dolor sit amet... ( ${index + 1} )`}
              required
            />
            {descriptions.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveDescription(index)}
                className="text-red-700 hover:text-red-900 transition-colors"
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
          className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
        >
          + Add Description
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          className={`mt-4 px-4 py-2 w-full bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:cursor-pointer flex justify-center items-center ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
