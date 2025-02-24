import React from "react";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/api/placeholder/1920/1080')",
          // Ganti URL di atas dengan URL gambar background Anda
        }}
      >
        {/* Overlay gelap untuk membuat teks lebih mudah dibaca */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Container untuk teks */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center h-full max-w-xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Selamat Datang di Website Kami
            </h1>
            <p className="text-xl md:text-2xl text-gray-200">
              Temukan pengalaman terbaik dalam layanan kami yang berkualitas
            </p>
            <p className="text-lg md:text-xl text-gray-300">
              Kami siap membantu mewujudkan visi Anda menjadi kenyataan
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
