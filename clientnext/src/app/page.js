import Home from "@/components/Home/Home";
import About from "@/components/About/About";
import Service from "@/components/Service/Service";
import Branch from "@/components/Branches/Branch";
import WhyUs from "@/components/WhyUs/WhyUs";
import Event from "@/components/Events/Event";
import Reviews from "@/components/Reviews/Reviews";


export default function Page() {
  return (
    <main>
    <Home />
    <About />
    <Service />
    <Branch />
    <WhyUs />
    <Event />
    <Reviews />
    </main>
  );
}
