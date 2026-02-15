import { possibilities } from "../../constants";

export const FooterBanner = () => {
  return (
    <div className="w-full px-8  my-[150px]">
      <div className="bg-[#ECB4FF] py-[50px] rounded-[16px] flex flex-col items-center">
        <h1 className="text-[35px] font-bold text-black">One Brain, Infinite Possibilities</h1>
        <p className="mt-10 w-[55%] text-center text-black">
          Whether you&apos;re using a wearable AI assistant, a productivity app, or an autonomous
          robot, FloBrain provides the intelligence layer you need.
        </p>
        <div className="mt-[50px] flex flex-row gap-[50px]">
          {possibilities.map((possibility) => (
            <div className="flex flex-row gap-2 items-center text-black" key={possibility}>
              <div className="rounded-full bg-[#1F832D] size-2" />
              <div>{possibility}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
