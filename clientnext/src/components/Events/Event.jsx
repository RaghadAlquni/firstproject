"use client";
import Image from "next/image";

const events = [
  {
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/fWuU3Sv06p.png",
    title: "واحة المعرفة تحتفي بيوم الأم",
    desc: "أقامت واحة المعرفة فعالية خاصة بمناسبة يوم الأم، شارك فيها الأطفال بتقديم فقرات وأناشيد وعبارات شكر تعبيرًا عن حبهم وامتنانهم...",
    date: "5 أكتوبر 2025",
    color: "#F9B236",
  },
  {
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/fWuU3Sv06p.png",
    title: "واحة المعرفة تحتفي بيوم المعلم",
    desc: "نظمت واحة المعرفة فعالية خاصة بمناسبة يوم المعلم، شارك فيها الأطفال بتقديم عبارات شكر ورسومات معبرة...",
    date: "5 أكتوبر 2025",
    color: "#17B3DC",
  },
  {
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/r39c2zfgjm.png",
    title: "واحة المعرفة تحتفل بتخريج دفعة جديدة من أطفالها",
    desc: "احتفلت واحة المعرفة بتخريج دفعة جديدة من أطفالها في أجواء مميزة مليئة بالفرح والفخر...",
    date: "5 أكتوبر 2025",
    color: "#F9B236",
  },
];

const Event = () => {
  return (
    <div id="Events" className="relative w-full py-20 overflow-x-hidden">

      {/* الخلفية */}
      <div className="absolute inset-0 bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-14/aw9gOVkv2u.png')] bg-cover bg-no-repeat"></div>
      
      {/* المحتوى */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 flex flex-col gap-10 lg:pt-12 md:pt-24">

        {/* العنوان */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#282828] mb-6 leading-tight text-center mx-auto">
          فعاليات وأخبار 
          <span className="text-[#F9B236] mx-2">واحة المعرفة</span>
        </h1>

        {/* الكروت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center items-stretch">

          {events.map((event, i) => (
            <div
              key={i}
              className="
                group 
                w-full max-w-[360px] md:max-w-[390px]
                rounded-tl-[70px] rounded-tr-[70px] rounded-br-[10px] rounded-bl-[10px]
                border border-dashed 
                p-1.5 flex flex-col 
                transition-all duration-300 
                hover:scale-[1.02]
              "
              style={{
                borderColor: event.color,
                minHeight: "390px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = event.color)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >

              {/* الصورة */}
              <div
                className="
                  w-full h-[260px] bg-cover bg-center 
                  rounded-tl-[65px] rounded-tr-[65px] rounded-br-[2px] rounded-bl-[2px] 
                  relative
                "
                style={{ backgroundImage: `url(${event.img})` }}
              >
                <div
                  className="
                    absolute bottom-0 right-0 
                    mb-0 mr-3 px-4 py-[2px] text-white text-[14px]
                    rounded-tl-[12px] rounded-tr-[12px]
                  "
                  style={{ backgroundColor: event.color }}
                >
                  {event.date}
                </div>
              </div>

              {/* الخط تحت الصورة */}
              <div className="w-full h-[1px] bg-[#F1F1F1] mt-3"></div>

              {/* المحتوى */}
              <div className="flex flex-col gap-2 mt-3 text-right flex-grow px-1">
                <h2 className="text-[18px] font-bold text-[#292929] leading-[1.4] group-hover:text-white">
                  {event.title}
                </h2>

                <p className="text-[13px] text-[#292929] leading-relaxed group-hover:text-white">
                  {event.desc}{" "}
                  <span className="font-bold underline group-hover:text-white">
                    قراءة المزيد
                  </span>
                </p>
              </div>

            </div>
          ))}

        </div>

{/* القسم السفلي */}
<div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center mt-4 gap-6">

  {/* النصوص — يمين */}
  <div className="flex flex-col items-start text-right gap-1 w-full md:w-auto">

    <div className="flex items-center gap-2">
      <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: "#F9B236" }}></span>
      <span className="text-[18px] font-semibold text-[#F9B236]">
        اخبار واحة المعرفة
      </span>
    </div>

    <div className="flex items-center gap-2">
      <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: "#17B3DC" }}></span>
      <span className="text-[18px] font-semibold text-[#129CC1]">
        فعاليات واحة المعرفة
      </span>
    </div>

  </div>

  {/* الزر — بالنص دائمًا */}
  <div className="flex justify-center">
    <button className="bg-[#F9B236] text-white font-medium text-[18px] px-10 py-3 rounded-full shadow-md whitespace-nowrap">
      المزيد من الفعاليات والأخبار
    </button>
  </div>

  {/* عمود فارغ (يسار) — فقط للموازنة */}
  <div className="hidden md:block"></div>

</div>

      </div>
    </div>
  );
};

export default Event;