import { Hero } from "@/components/hero/hero";
import {  WhySubscribe } from "@/components/sections/how-to-subscribe";
import { LanguageCenter } from "@/components/sections/language-center";
import { JoinOurTeam } from "@/components/sections/join-our-team";
import { OurPartners } from "@/components/sections/our-partners";
import { UnitecBusiness } from "@/components/sections/unitec-business";
import { AboutUs } from "@/components/sections/about-us";
import { Testimonials } from "@/components/sections/testimonials";
import { HomeMotion } from "@/components/home/home-motion";
import { HomeFeaturedCourses, HomeNewCourses, HomePopularCourses } from "@/components/home/home-course-sections";
import { AreasAprendizagem } from "@/components/sections/home/Areasaprendizagem";
import { BannerLanguageCenter } from "@/components/sections/home/Bannerlanguagecenter";
import { ModalidadesFormacao } from "@/components/sections/home/Modalidadesformacao";
import { BannerEquipa } from "@/components/sections/home/Bannerequipa";
export default function Page() {
  return (
    <>
      {/* <HomeMotion> */}
        <Hero />
        <ModalidadesFormacao />
        <AreasAprendizagem />
        <BannerLanguageCenter />
        
        {/* <LanguageCenter /> */}
        <HomeFeaturedCourses />
        <HomePopularCourses />
        <HomeNewCourses />
        <BannerEquipa />
        {/* <JoinOurTeam />  */}
        <WhySubscribe />
        {/* <OurPartners /> */}
        <UnitecBusiness />
        <AboutUs />
        <Testimonials />
      {/* </HomeMotion> */}
    </>
  );
}
