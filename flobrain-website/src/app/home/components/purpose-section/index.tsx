"use client";

import { Reveal } from "@/components/motion";

const LEARNING_OPPORTUNITIES_HREF = "https://www.bootcampuniversity.org/";

export const PurposeSection = () => {
  return (
    <section
      aria-labelledby="shared-purpose-heading"
      className="w-full px-6 pt-8 sm:px-10 sm:pt-12 md:px-16 md:pt-16 lg:px-[120px] xl:px-[179px] pb-16 sm:pb-20 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[980px]">
        <Reveal variant="fadeIn" inView>
          <p className="text-center text-[13px] font-medium text-[#CC34FF] light:text-[#610081] sm:text-sm">
            Our shared purpose
          </p>
        </Reveal>

        <Reveal variant="fadeIn" inView delay={0.06}>
          <h2
            id="shared-purpose-heading"
            className="mx-auto mt-4 max-w-[16ch] text-center text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-white light:text-[#000000] sm:mt-5 sm:max-w-none sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.5rem]"
          >
            Talent is everywhere.
            <br />
            Opportunity should be too.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-y-14 sm:mt-16 md:mt-24 md:grid-cols-2 md:gap-x-16 lg:mt-28 lg:gap-x-24 lg:px-6">
          <Reveal variant="slideUp" inView delay={0.08}>
            <div className="max-w-[340px]">
              <h3 className="text-[15px] font-semibold text-[#CC34FF] light:text-[#610081]">
                Mission
              </h3>
              <p className="mt-4 text-[15px] font-semibold leading-snug text-white light:text-[#000000] sm:text-[17px]">
                Aspire to inspire
                <br />
                Help as many people as possible.
                <br />
                Live long and prosper.
              </p>
              <p className="mt-6 text-[14px] leading-relaxed text-zinc-400 light:text-[#3f3f46] sm:text-[15px]">
                At FloStudios, we bring this purpose to life through design, storytelling, and
                creative projects that help people learn, build, and turn ideas into useful
                experiences.
              </p>
            </div>
          </Reveal>

          <Reveal variant="slideUp" inView delay={0.14} className="md:justify-self-end">
            <div className="max-w-[360px]">
              <h3 className="text-[15px] font-semibold text-[#CC34FF] light:text-[#610081]">
                Vision
              </h3>
              <p className="mt-4 text-[15px] font-medium leading-relaxed text-white light:text-[#000000] sm:text-[17px]">
                A world where talent everywhere has access to experiential learning, frontier
                technologies, and meaningful opportunities to solve humanity&apos;s greatest
                challenges and build a healthier, longer, and more prosperous future
              </p>

              <div className="mt-12 max-w-[300px] md:mt-28 lg:mt-36">
                <p className="text-[14px] leading-relaxed text-zinc-400 light:text-[#3f3f46] sm:text-[15px]">
                  Our teams build together across disciplines, developing their craft through work
                  with a purpose.
                </p>
                <a
                  href={LEARNING_OPPORTUNITIES_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-[15px] font-medium text-white underline decoration-1 underline-offset-[5px] transition-colors hover:text-[#CC34FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#CC34FF] light:text-[#000000] light:hover:text-[#610081] light:focus-visible:outline-[#610081]"
                >
                  Explore learning opportunities
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
