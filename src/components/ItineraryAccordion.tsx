import { useState } from "react";

const ItineraryAccordion = ({ packageDetails }: any) => {
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});

  const toggleDay = (day: any) => {
    setOpenDays((prev: any) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <>
      {packageDetails.itinerary.map((day: any) => (
        <div
          key={day.day}
          className="border border-gray-300 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleDay(day.day)}
            className="w-full px-3 py-3 flex items-center justify-between bg-gray-50 hover:bg-sandy-beige transition-colors"
          >
            <div className="flex items-center">
              <span className="text-lg font-semibold">Hari {day.day}</span>
              <span className="ml-2 text-gray-600 font-medium">
                {day.title}
              </span>
            </div>
            {openDays[day.day] ? (
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
                className="w-4 h-4 text-gray-600"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            ) : (
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
                className="w-4 h-4 text-gray-600"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
          </button>
          <div
            className={`
                overflow-hidden transition-all duration-200
                ${openDays[day.day] ? "max-h-96 p-4" : "max-h-0"}
              `}
          >
            <ul className="space-y-2">
              {day.activities.map((activity: string, index: string) => (
                <li
                  key={index}
                  className="flex items-center text-gray-600 sm:text-base text-sm"
                >
                  <div className="w-2 h-2 bg-deep-blue rounded-full mr-1" />
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
};

export default ItineraryAccordion;
