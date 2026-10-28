import { PARTNERS } from "@/lib/partners";
import { InfiniteSlider } from "../motion-primitives/infinite-slider";
import Image from "next/image";

export function OurPartners() {
    return (
        <div className="bg-gradient-primary h-100 ">

            <section className="container-page space-y-10  w-full h-full py-20">
                <h2 data-split className="text-2xl font-extrabold text-center text-white lg:text-3xl">Instituições que colaboram <br /> connosco</h2>
                <div data-reveal>
                <InfiniteSlider speed={80} speedOnHover={50}>
                    {PARTNERS.map((partner) => (
                        <div key={partner.name} className="flex items-center gap-10 justify-center">
                            <Image
                                src={partner.image}
                                alt={partner.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-contain mx-4"
                            />
                        </div>
                    ))}
                </InfiniteSlider>
                </div>
            </section>
        </div>
    )
}

