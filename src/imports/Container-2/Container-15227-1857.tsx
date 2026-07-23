import svgPaths from "./svg-2pmspjfk3a";

function Heading() {
  return (
    <div className="h-[28.003px] relative shrink-0 w-[68.941px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold','Noto_Sans_JP:Bold','Noto_Sans_SC:Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#101828] text-[18px] top-[0.33px] tracking-[-0.4395px] whitespace-nowrap">上传完成· 已上传2份文件</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
            <path d={svgPaths.p354ab980} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
            <path d={svgPaths.p2a4db200} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.986px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[3.993px] px-[3.993px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[60.556px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-b-[0.556px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[16.556px] pt-[16px] px-[23.993px] relative size-full">
          <Heading />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.67px] tracking-[-0.1504px] whitespace-nowrap">2 个文件上传失败</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.998px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9983 15.9983">
        <g clipPath="url(#clip0_15226_1805)" id="Icon">
          <path d={svgPaths.p26d0ef00} id="Vector" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
          <path d={svgPaths.p18687900} id="Vector_2" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
          <path d={svgPaths.p1c555e00} id="Vector_3" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
        </g>
        <defs>
          <clipPath id="clip0_15226_1805">
            <rect fill="white" height="15.9983" width="15.9983" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20px] relative shrink-0 w-[158.793px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.67px] tracking-[-0.1504px] whitespace-nowrap">Chapter 2 - Calculus.pdf</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[364.063px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-center relative size-full">
        <Icon1 />
        <Text />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[26.849px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] left-[13px] not-italic text-[#155dfc] text-[14px] text-center top-[0.67px] tracking-[-0.1504px] whitespace-nowrap">重试</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[45.104px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12.553px] py-[12.556px] relative size-full">
          <Container6 />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[15.998px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9983 15.9983">
        <g clipPath="url(#clip0_15226_1805)" id="Icon">
          <path d={svgPaths.p26d0ef00} id="Vector" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
          <path d={svgPaths.p18687900} id="Vector_2" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
          <path d={svgPaths.p1c555e00} id="Vector_3" stroke="var(--stroke-0, #FB2C36)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33319" />
        </g>
        <defs>
          <clipPath id="clip0_15226_1805">
            <rect fill="white" height="15.9983" width="15.9983" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[126.016px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] top-[0.67px] tracking-[-0.1504px] whitespace-nowrap">Problem Set 3.docx</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[20px] relative shrink-0 w-[364.063px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-center relative size-full">
        <Icon2 />
        <Text1 />
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[20px] relative shrink-0 w-[26.849px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] left-[13px] not-italic text-[#155dfc] text-[14px] text-center top-[0.67px] tracking-[-0.1504px] whitespace-nowrap">重试</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[45.104px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12.553px] py-[12.556px] relative size-full">
          <Container8 />
          <Button2 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[7.995px] h-[98.203px] items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container7 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[11.997px] h-[130.2px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Container4 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[213px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[20px] items-start pt-[20px] px-[23.993px] relative size-full">
        <p className="font-['Inter:Semi_Bold','Noto_Sans_JP:Bold','Noto_Sans_SC:Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[14px] text-black tracking-[-0.1504px] whitespace-nowrap">你可以先开始学习，稍后再重试失败文件</p>
        <Container3 />
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[37.101px] relative rounded-[10px] shrink-0 w-[109.792px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] left-[54.55px] not-italic text-[#364153] text-[14px] text-center top-[9.22px] tracking-[-0.1504px] whitespace-nowrap">全部重试 (2)</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#155dfc] h-[35.99px] relative rounded-[10px] shrink-0 w-[66.849px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium leading-[20px] left-[33px] not-italic text-[14px] text-center text-white top-[8.66px] tracking-[-0.1504px] whitespace-nowrap">继续</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[69.653px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-solid border-t-[0.556px] inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[11.997px] items-center justify-end pb-[16px] pl-[24px] pr-[23.993px] pt-[16.556px] relative size-full">
          <Button3 />
          <Button4 />
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_25px_25px_rgba(0,0,0,0.25)] flex flex-col items-start relative rounded-[16px] size-full" data-name="Container">
      <Container1 />
      <Container2 />
      <Container9 />
    </div>
  );
}