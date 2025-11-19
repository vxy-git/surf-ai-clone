'use client'

import Image from 'next/image'

const brands = [
  { name: 'Fenbushi', logo: '/images/fenbushi.png' },
  { name: 'Ledger', logo: '/images/ledger.png' },
  { name: 'Mask', logo: '/images/mask.png' },
  { name: 'Republic', logo: '/images/republic.png' },
  { name: 'Skyland', logo: '/images/skyland.png' },
  { name: 'Uphonest', logo: '/images/uphonest.png' },
  { name: 'B1V', logo: '/images/b1v.png' },
]

export default function BrandCarousel() {
  return (
    <section className="relative bg-black pt-16 md:pt-20 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Logo静态网格展示 */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="w-28 h-28 md:w-32 md:h-32 group"
            >
              {/* 渐变边框容器 */}
              <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 group-hover:shadow-2xl group-hover:shadow-purple-500/40 transition-all duration-300">
                {/* 玻璃态卡片 */}
                <div className="w-full h-full rounded-2xl p-4 md:p-5 bg-black/80 backdrop-blur-lg flex items-center justify-center group-hover:scale-100 transition-transform duration-300">
                  <div className="relative w-full h-full group-hover:brightness-110 transition-all duration-300">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 112px, 128px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
